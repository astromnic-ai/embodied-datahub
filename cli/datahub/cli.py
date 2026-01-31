"""Main CLI entry point for DataHub."""

import os
import sys
from pathlib import Path
from typing import Optional

import click
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.table import Table

from . import __version__
from .api import APIClient, APIError
from .config import (
    clear_token,
    get_api_url,
    get_cos_config,
    get_token,
    set_api_url,
    set_cos_config,
    set_token,
)
from .cos import (
    collect_files,
    download_dataset,
    download_dataset_http,
    format_size,
    list_objects,
    upload_folder,
)


console = Console()


@click.group()
@click.version_option(version=__version__, prog_name="datahub")
def main():
    """Embodied DataHub CLI - Upload and download robot datasets."""
    pass


# ============== Config Commands ==============

@main.group()
def config():
    """Manage CLI configuration."""
    pass


@config.command("api")
@click.argument("url", required=False)
def config_api(url: Optional[str]):
    """Set or show the API URL."""
    if url:
        set_api_url(url)
        console.print(f"[green]API URL set to:[/green] {url}")
    else:
        current_url = get_api_url()
        console.print(f"[blue]Current API URL:[/blue] {current_url}")


@config.command("cos")
@click.option("--secret-id", prompt="COS Secret ID", help="Tencent COS Secret ID")
@click.option("--secret-key", prompt="COS Secret Key", hide_input=True, help="Tencent COS Secret Key")
@click.option("--region", prompt="COS Region", default="ap-shanghai", help="COS Region (e.g., ap-shanghai)")
@click.option("--bucket", prompt="COS Bucket", help="COS Bucket name")
def config_cos(secret_id: str, secret_key: str, region: str, bucket: str):
    """Configure Tencent COS credentials."""
    set_cos_config(secret_id, secret_key, region, bucket)
    console.print("[green]COS configuration saved successfully![/green]")


@config.command("show")
def config_show():
    """Show current configuration."""
    api_url = get_api_url()
    cos_config = get_cos_config()
    token = get_token()
    
    table = Table(title="DataHub Configuration")
    table.add_column("Setting", style="cyan")
    table.add_column("Value", style="green")
    
    table.add_row("API URL", api_url)
    table.add_row("Logged In", "Yes" if token else "No")
    table.add_row("COS Region", cos_config["region"] or "(not set)")
    table.add_row("COS Bucket", cos_config["bucket"] or "(not set)")
    table.add_row("COS Secret ID", cos_config["secret_id"][:8] + "..." if cos_config["secret_id"] else "(not set)")
    
    console.print(table)


# ============== Auth Commands ==============

@main.command()
@click.option("--username", "-u", prompt="Username", help="Admin username")
@click.option("--password", "-p", prompt="Password", hide_input=True, help="Admin password")
def login(username: str, password: str):
    """Login to DataHub."""
    try:
        client = APIClient()
        token = client.login(username, password)
        set_token(token)
        console.print("[green]Successfully logged in![/green]")
    except APIError as e:
        console.print(f"[red]Login failed:[/red] {e.message}")
        sys.exit(1)


@main.command()
def logout():
    """Logout from DataHub."""
    clear_token()
    console.print("[green]Successfully logged out![/green]")


@main.command()
def whoami():
    """Check login status."""
    token = get_token()
    if not token:
        console.print("[yellow]Not logged in.[/yellow]")
        return
    
    try:
        client = APIClient()
        if client.check_auth():
            console.print("[green]Logged in and authenticated.[/green]")
        else:
            console.print("[yellow]Token expired. Please login again.[/yellow]")
            clear_token()
    except Exception as e:
        console.print(f"[red]Error checking auth:[/red] {e}")


# ============== Dataset Commands ==============

@main.command("list")
def list_datasets():
    """List all datasets."""
    try:
        client = APIClient()
        datasets = client.list_datasets()
        
        if not datasets:
            console.print("[yellow]No datasets found.[/yellow]")
            return
        
        table = Table(title="Datasets")
        table.add_column("ID", style="cyan")
        table.add_column("Name", style="green")
        table.add_column("Author", style="blue")
        table.add_column("Size", style="magenta")
        table.add_column("Downloads", style="yellow")
        
        for ds in datasets:
            table.add_row(
                ds.get("id", ""),
                ds.get("name", ""),
                ds.get("author", ""),
                ds.get("size", ""),
                str(ds.get("downloads", 0)),
            )
        
        console.print(table)
        
    except APIError as e:
        console.print(f"[red]Error:[/red] {e.message}")
        sys.exit(1)


@main.command("info")
@click.argument("dataset_id")
def dataset_info(dataset_id: str):
    """Show dataset details."""
    try:
        client = APIClient()
        ds = client.get_dataset(dataset_id)
        
        table = Table(title=f"Dataset: {ds.get('name', dataset_id)}")
        table.add_column("Field", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("ID", ds.get("id", ""))
        table.add_row("Name", ds.get("name", ""))
        table.add_row("Author", ds.get("author", ""))
        table.add_row("Description", ds.get("description", "")[:100] + "..." if len(ds.get("description", "")) > 100 else ds.get("description", ""))
        table.add_row("Format", ds.get("datasetFormat", ""))
        table.add_row("Robot Type", ds.get("robotType", ""))
        table.add_row("Task Type", ds.get("taskType", ""))
        table.add_row("Size", ds.get("size", ""))
        table.add_row("Downloads", str(ds.get("downloads", 0)))
        table.add_row("Episodes", str(ds.get("totalEpisodes", 0)))
        table.add_row("Frames", str(ds.get("totalFrames", 0)))
        table.add_row("FPS", str(ds.get("fps", 0)))
        table.add_row("License", ds.get("license", ""))
        table.add_row("Updated", ds.get("updatedAt", ""))
        
        console.print(table)
        
        # Show files
        files = ds.get("files", [])
        if files:
            console.print(f"\n[bold]Files ({len(files)}):[/bold]")
            for f in files[:10]:
                console.print(f"  - {f.get('path', f.get('name', ''))}")
            if len(files) > 10:
                console.print(f"  ... and {len(files) - 10} more files")
        
    except APIError as e:
        console.print(f"[red]Error:[/red] {e.message}")
        sys.exit(1)


@main.command("create")
@click.argument("name")
@click.option("--author", "-a", required=True, help="Author or organization name")
@click.option("--description", "-d", default="", help="Dataset description")
@click.option("--format", "dataset_format", type=click.Choice(["lerobot", "corobot"]), default="lerobot", help="Dataset format")
@click.option("--robot-type", default="", help="Robot type")
@click.option("--task-type", default="", help="Task type")
@click.option("--license", "license_", default="MIT", help="License")
def create_dataset(
    name: str,
    author: str,
    description: str,
    dataset_format: str,
    robot_type: str,
    task_type: str,
    license_: str,
):
    """Create a new dataset (metadata only)."""
    if not get_token():
        console.print("[red]Please login first: datahub login[/red]")
        sys.exit(1)
    
    try:
        client = APIClient()
        
        # Generate ID from name
        dataset_id = name.lower().replace(" ", "-").replace("_", "-")
        dataset_id = "".join(c for c in dataset_id if c.isalnum() or c == "-")
        
        data = {
            "id": dataset_id,
            "name": name,
            "author": author,
            "description": description,
            "datasetFormat": dataset_format,
            "robotType": robot_type,
            "taskType": task_type,
            "license": license_,
            "downloads": 0,
            "likes": 0,
            "tags": [],
        }
        
        result = client.create_dataset(data)
        console.print(f"[green]Dataset created successfully![/green]")
        console.print(f"Dataset ID: [cyan]{result.get('id')}[/cyan]")
        console.print(f"\nTo upload files, run:")
        console.print(f"  [blue]datahub upload {result.get('id')} /path/to/folder[/blue]")
        
    except APIError as e:
        console.print(f"[red]Error:[/red] {e.message}")
        sys.exit(1)


@main.command("upload")
@click.argument("dataset_id")
@click.argument("folder_path", type=click.Path(exists=True, file_okay=False, dir_okay=True))
@click.option("--workers", "-w", default=4, help="Number of parallel upload workers")
def upload_dataset(dataset_id: str, folder_path: str, workers: int):
    """Upload a folder to a dataset."""
    if not get_token():
        console.print("[red]Please login first: datahub login[/red]")
        sys.exit(1)
    
    # Check COS config
    cos_config = get_cos_config()
    if not cos_config["secret_id"] or not cos_config["bucket"]:
        console.print("[red]COS not configured. Run: datahub config cos[/red]")
        sys.exit(1)
    
    try:
        client = APIClient()
        
        # Check if dataset exists
        try:
            client.get_dataset(dataset_id)
        except APIError as e:
            if e.status_code == 404:
                console.print(f"[red]Dataset '{dataset_id}' not found. Create it first:[/red]")
                console.print(f"  [blue]datahub create \"{dataset_id}\" --author \"Your Name\"[/blue]")
                sys.exit(1)
            raise
        
        folder = Path(folder_path).resolve()
        
        # Check for .git directory
        git_dir = folder / ".git"
        if git_dir.exists():
            console.print("[yellow]Note: .git directory detected and will be ignored.[/yellow]")
            console.print("[dim]Only data files will be uploaded.[/dim]\n")
        
        console.print(f"[blue]Scanning folder: {folder}[/blue]")
        console.print("[dim]Ignoring: .git, __pycache__, .DS_Store, .env, etc.[/dim]")
        
        files = collect_files(str(folder))
        
        if not files:
            console.print("[yellow]No files found in the folder (after filtering).[/yellow]")
            console.print("[dim]Make sure the folder contains data files like .parquet, .json, .mp4, etc.[/dim]")
            return
        
        total_size = sum(os.path.getsize(f[0]) for f in files)
        console.print(f"[green]Found {len(files)} files to upload ({format_size(total_size)})[/green]")
        console.print(f"[blue]Target dataset: {dataset_id}[/blue]\n")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            TextColumn("{task.fields[size]}"),
            console=console,
        ) as progress:
            task = progress.add_task(
                "Uploading...",
                total=total_size,
                size=f"0 / {format_size(total_size)}",
            )
            
            def update_progress(completed: int):
                progress.update(
                    task,
                    completed=completed,
                    size=f"{format_size(completed)} / {format_size(total_size)}",
                )
            
            uploaded_files = upload_folder(
                str(folder),
                dataset_id,
                progress,
                task,
                max_workers=workers,
            )
        
        # Notify server of upload completion
        console.print("\n[blue]Updating dataset metadata...[/blue]")
        client.upload_complete(dataset_id, uploaded_files, total_size)
        
        console.print(f"\n[green]Successfully uploaded {len(uploaded_files)} files![/green]")
        console.print(f"View at: [blue]{get_api_url()}/datasets/{dataset_id}[/blue]")
        
    except APIError as e:
        console.print(f"[red]API Error:[/red] {e.message}")
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]Error:[/red] {e}")
        sys.exit(1)


@main.command("download")
@click.argument("dataset_id")
@click.argument("output_path", type=click.Path(), default=".")
@click.option("--workers", "-w", default=4, help="Number of parallel download workers")
def download(dataset_id: str, output_path: str, workers: int):
    """Download a dataset to local folder."""
    # Check COS config - if not configured, use HTTP download mode
    cos_config = get_cos_config()
    use_cos = cos_config["secret_id"] and cos_config["bucket"]
    
    try:
        # Get dataset info from API
        client = APIClient()
        try:
            ds = client.get_dataset(dataset_id)
            console.print(f"[blue]Downloading dataset: {ds.get('name', dataset_id)}[/blue]")
        except APIError as e:
            if e.status_code == 404:
                console.print(f"[red]Dataset '{dataset_id}' not found.[/red]")
                sys.exit(1)
            raise
        
        # Create output directory
        output_dir = Path(output_path) / dataset_id
        output_dir.mkdir(parents=True, exist_ok=True)
        
        if use_cos:
            # Use COS SDK for download (requires credentials)
            prefix = f"datasets/{dataset_id}/"
            objects = list_objects(prefix)
            
            if not objects:
                console.print("[yellow]No files found for this dataset.[/yellow]")
                return
            
            total_size = sum(obj["Size"] for obj in objects)
            console.print(f"[blue]Found {len(objects)} files ({format_size(total_size)})[/blue]")
            console.print("[dim]Using COS SDK for download[/dim]\n")
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TaskProgressColumn(),
                TextColumn("{task.fields[size]}"),
                console=console,
            ) as progress:
                task = progress.add_task(
                    "Downloading...",
                    total=total_size,
                    size=f"0 / {format_size(total_size)}",
                )
                
                download_dataset(
                    dataset_id,
                    str(output_dir),
                    progress,
                    task,
                    max_workers=workers,
                )
        else:
            # Use HTTP download (for public readable buckets)
            files = ds.get("files", [])
            
            if not files:
                console.print("[yellow]No files found for this dataset.[/yellow]")
                return
            
            # Filter files with ossUrl
            downloadable = [f for f in files if f.get("ossUrl")]
            if not downloadable:
                console.print("[red]No downloadable files found. Files may not have public URLs.[/red]")
                console.print("[dim]Try configuring COS credentials: datahub config cos[/dim]")
                sys.exit(1)
            
            # Estimate total size (parse from size string like "1.5 MB")
            console.print(f"[blue]Found {len(downloadable)} files[/blue]")
            console.print("[dim]Using HTTP download (no COS credentials required)[/dim]\n")
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TaskProgressColumn(),
                console=console,
            ) as progress:
                task = progress.add_task(
                    "Downloading...",
                    total=len(downloadable),
                )
                
                download_dataset_http(
                    downloadable,
                    str(output_dir),
                    progress,
                    task,
                    max_workers=workers,
                )
        
        console.print(f"\n[green]Successfully downloaded to: {output_dir}[/green]")
        
    except APIError as e:
        console.print(f"[red]API Error:[/red] {e.message}")
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]Error:[/red] {e}")
        sys.exit(1)


@main.command("delete")
@click.argument("dataset_id")
@click.option("--yes", "-y", is_flag=True, help="Skip confirmation")
def delete(dataset_id: str, yes: bool):
    """Delete a dataset."""
    if not get_token():
        console.print("[red]Please login first: datahub login[/red]")
        sys.exit(1)
    
    if not yes:
        if not click.confirm(f"Are you sure you want to delete dataset '{dataset_id}'?"):
            console.print("[yellow]Cancelled.[/yellow]")
            return
    
    try:
        client = APIClient()
        client.delete_dataset(dataset_id)
        console.print(f"[green]Dataset '{dataset_id}' deleted successfully![/green]")
        
    except APIError as e:
        console.print(f"[red]Error:[/red] {e.message}")
        sys.exit(1)


if __name__ == "__main__":
    main()
