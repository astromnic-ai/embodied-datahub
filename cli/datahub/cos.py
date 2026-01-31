"""Tencent Cloud COS operations for DataHub CLI."""

import os
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from qcloud_cos import CosConfig, CosS3Client
from rich.progress import Progress, TaskID

from .config import get_cos_config
from .parquet_preview import is_parquet_file, extract_parquet_preview, check_pyarrow_available


def get_cos_client() -> CosS3Client:
    """Get a configured COS client."""
    config = get_cos_config()
    
    if not config["secret_id"] or not config["secret_key"]:
        raise ValueError(
            "COS credentials not configured. Run 'datahub config cos' to set up."
        )
    
    cos_config = CosConfig(
        Region=config["region"],
        SecretId=config["secret_id"],
        SecretKey=config["secret_key"],
        Token=None,
        Scheme="https",
    )
    return CosS3Client(cos_config)


def get_bucket_name() -> str:
    """Get the configured bucket name."""
    config = get_cos_config()
    if not config["bucket"]:
        raise ValueError(
            "COS bucket not configured. Run 'datahub config cos' to set up."
        )
    return config["bucket"]


def upload_file(
    local_path: str,
    cos_key: str,
    progress_callback: Optional[Callable[[int], None]] = None,
) -> str:
    """
    Upload a single file to COS.
    
    Args:
        local_path: Local file path
        cos_key: COS object key (path in bucket)
        progress_callback: Optional callback for progress updates
        
    Returns:
        The COS URL of the uploaded file
    """
    client = get_cos_client()
    bucket = get_bucket_name()
    config = get_cos_config()
    
    file_size = os.path.getsize(local_path)
    
    # Use multipart upload for large files (> 20MB)
    if file_size > 20 * 1024 * 1024:
        response = client.upload_file(
            Bucket=bucket,
            Key=cos_key,
            LocalFilePath=local_path,
            EnableMD5=False,
            progress_callback=progress_callback,
        )
    else:
        with open(local_path, "rb") as f:
            response = client.put_object(
                Bucket=bucket,
                Key=cos_key,
                Body=f,
                EnableMD5=False,
            )
        if progress_callback:
            progress_callback(file_size)
    
    # Return the public URL
    return f"https://{bucket}.cos.{config['region']}.myqcloud.com/{cos_key}"


def download_file(
    cos_key: str,
    local_path: str,
    progress_callback: Optional[Callable[[int], None]] = None,
) -> None:
    """
    Download a single file from COS.
    
    Args:
        cos_key: COS object key (path in bucket)
        local_path: Local file path to save to
        progress_callback: Optional callback for progress updates
    """
    client = get_cos_client()
    bucket = get_bucket_name()
    
    # Ensure parent directory exists
    Path(local_path).parent.mkdir(parents=True, exist_ok=True)
    
    # Get file size first
    response = client.head_object(Bucket=bucket, Key=cos_key)
    file_size = int(response.get("Content-Length", 0))
    
    # Download
    if file_size > 20 * 1024 * 1024:
        # Use download_file for large files
        client.download_file(
            Bucket=bucket,
            Key=cos_key,
            DestFilePath=local_path,
        )
    else:
        response = client.get_object(
            Bucket=bucket,
            Key=cos_key,
        )
        response["Body"].get_stream_to_file(local_path)
    
    if progress_callback:
        progress_callback(file_size)


def download_file_http(
    url: str,
    local_path: str,
    progress_callback: Optional[Callable[[int], None]] = None,
) -> int:
    """
    Download a file via HTTP (for public readable buckets).
    
    Args:
        url: Public URL to download from
        local_path: Local file path to save to
        progress_callback: Optional callback for progress updates
        
    Returns:
        Downloaded file size in bytes
    """
    # Ensure parent directory exists
    Path(local_path).parent.mkdir(parents=True, exist_ok=True)
    
    # Stream download
    response = requests.get(url, stream=True, timeout=300)
    response.raise_for_status()
    
    file_size = int(response.headers.get("content-length", 0))
    downloaded = 0
    
    with open(local_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
    
    if progress_callback:
        progress_callback(file_size or downloaded)
    
    return file_size or downloaded


def download_dataset_http(
    files: List[Dict[str, Any]],
    output_path: str,
    progress: Progress,
    task_id: TaskID,
    max_workers: int = 4,
) -> None:
    """
    Download dataset files via HTTP (for public readable buckets).
    
    Args:
        files: List of file info dicts with 'path' and 'ossUrl'
        output_path: Local output directory
        progress: Rich progress instance
        task_id: Progress task ID
        max_workers: Number of parallel download workers
    """
    # Filter files with valid ossUrl
    downloadable = [f for f in files if f.get("ossUrl")]
    
    if not downloadable:
        raise ValueError("No downloadable files found (missing ossUrl)")
    
    downloaded_size = 0
    
    def download_single(file_info: Dict[str, Any]) -> int:
        nonlocal downloaded_size
        rel_path = file_info["path"]
        url = file_info["ossUrl"]
        local_path = os.path.join(output_path, rel_path)
        
        size = download_file_http(url, local_path)
        downloaded_size += size
        progress.update(task_id, completed=downloaded_size)
        return size
    
    # Download files with thread pool
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_single, f): f for f in downloadable}
        
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                file_info = futures[future]
                progress.console.print(f"[red]Failed to download {file_info['path']}: {e}[/red]")


def list_objects(prefix: str) -> List[dict]:
    """
    List objects in COS with a given prefix.
    
    Args:
        prefix: The prefix to filter objects
        
    Returns:
        List of object info dicts with 'Key' and 'Size'
    """
    client = get_cos_client()
    bucket = get_bucket_name()
    
    objects = []
    marker = ""
    
    while True:
        response = client.list_objects(
            Bucket=bucket,
            Prefix=prefix,
            Marker=marker,
            MaxKeys=1000,
        )
        
        contents = response.get("Contents", [])
        if not contents:
            break
            
        for obj in contents:
            objects.append({
                "Key": obj["Key"],
                "Size": int(obj["Size"]),
            })
        
        if response.get("IsTruncated") == "false":
            break
            
        marker = response.get("NextMarker", contents[-1]["Key"])
    
    return objects


def delete_objects(keys: List[str]) -> None:
    """
    Delete multiple objects from COS.
    
    Args:
        keys: List of object keys to delete
    """
    if not keys:
        return
        
    client = get_cos_client()
    bucket = get_bucket_name()
    
    # Delete in batches of 1000
    for i in range(0, len(keys), 1000):
        batch = keys[i:i + 1000]
        objects = [{"Key": key} for key in batch]
        client.delete_objects(
            Bucket=bucket,
            Delete={"Object": objects, "Quiet": "true"},
        )


# Directories and files to ignore during upload
IGNORE_PATTERNS = {
    # Version control
    ".git",
    ".svn",
    ".hg",
    # Python
    "__pycache__",
    ".pytest_cache",
    "*.pyc",
    "*.pyo",
    ".eggs",
    "*.egg-info",
    ".venv",
    "venv",
    # IDE
    ".idea",
    ".vscode",
    # OS
    ".DS_Store",
    "Thumbs.db",
    # Temp files
    "*.tmp",
    "*.temp",
    "*.swp",
    "*.swo",
}

IGNORE_FILES = {
    ".gitignore",
    ".gitattributes",
    ".gitmodules",
    ".DS_Store",
    "Thumbs.db",
    ".env",
    ".env.local",
}


def should_ignore(path: Path, rel_path: Path) -> bool:
    """
    Check if a file or directory should be ignored.
    
    Args:
        path: Absolute path
        rel_path: Relative path from the dataset folder
        
    Returns:
        True if should be ignored
    """
    # Check if any parent directory should be ignored
    for part in rel_path.parts:
        if part in IGNORE_PATTERNS or part.startswith(".git"):
            return True
    
    # Check filename
    filename = path.name
    if filename in IGNORE_FILES:
        return True
    
    # Check patterns with wildcards
    for pattern in IGNORE_PATTERNS:
        if pattern.startswith("*") and filename.endswith(pattern[1:]):
            return True
    
    return False


def collect_files(folder_path: str) -> List[Tuple[str, str]]:
    """
    Collect all files in a folder with their relative paths.
    Automatically ignores .git, __pycache__, and other common non-data files.
    
    Args:
        folder_path: Path to the folder
        
    Returns:
        List of tuples (absolute_path, relative_path)
    """
    folder = Path(folder_path).resolve()
    files = []
    
    for file_path in folder.rglob("*"):
        if file_path.is_file():
            rel_path = file_path.relative_to(folder)
            if not should_ignore(file_path, rel_path):
                files.append((str(file_path), str(rel_path)))
    
    return files


def upload_folder(
    folder_path: str,
    dataset_id: str,
    progress: Progress,
    task_id: TaskID,
    max_workers: int = 4,
) -> List[dict]:
    """
    Upload an entire folder to COS.
    
    Args:
        folder_path: Local folder path
        dataset_id: Dataset ID for COS prefix
        progress: Rich progress instance
        task_id: Progress task ID
        max_workers: Number of parallel upload workers
        
    Returns:
        List of uploaded file info
    """
    files = collect_files(folder_path)
    total_size = sum(os.path.getsize(f[0]) for f in files)
    progress.update(task_id, total=total_size)
    
    # Check if pyarrow is available for parquet preview
    pyarrow_available = check_pyarrow_available()
    parquet_files = [f for f in files if is_parquet_file(f[0])]
    if parquet_files and not pyarrow_available:
        progress.console.print(
            "[yellow]Warning: pyarrow not installed. Parquet preview will not be available.[/yellow]"
        )
        progress.console.print(
            "[dim]Install with: pip install pyarrow[/dim]\n"
        )
    
    uploaded_files = []
    uploaded_size = 0
    parquet_preview_count = 0
    
    def upload_single(file_info: Tuple[str, str]) -> dict:
        nonlocal uploaded_size, parquet_preview_count
        abs_path, rel_path = file_info
        cos_key = f"datasets/{dataset_id}/{rel_path}"
        
        file_size = os.path.getsize(abs_path)
        url = upload_file(abs_path, cos_key)
        
        result: Dict[str, Any] = {
            "name": Path(rel_path).name,
            "path": rel_path,
            "size": file_size,
            "url": url,
        }
        
        # Extract parquet preview data if applicable
        if is_parquet_file(abs_path) and pyarrow_available:
            preview_data = extract_parquet_preview(abs_path, max_rows=100)
            if preview_data:
                result["previewData"] = preview_data
                parquet_preview_count += 1
        
        return result
    
    # Upload files with thread pool
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(upload_single, f): f for f in files}
        
        for future in as_completed(futures):
            try:
                file_info = future.result()
                uploaded_files.append(file_info)
                uploaded_size += file_info["size"]
                progress.update(task_id, completed=uploaded_size)
            except Exception as e:
                file_path = futures[future][1]
                progress.console.print(f"[red]Failed to upload {file_path}: {e}[/red]")
    
    # Report parquet preview extraction results
    if parquet_files:
        preview_extracted = sum(1 for f in uploaded_files if f.get("previewData"))
        if preview_extracted > 0:
            progress.console.print(
                f"[green]Extracted preview data for {preview_extracted}/{len(parquet_files)} parquet files[/green]"
            )
        elif pyarrow_available:
            progress.console.print(
                f"[yellow]Warning: Failed to extract preview data for {len(parquet_files)} parquet files[/yellow]"
            )
    
    return uploaded_files


def download_dataset(
    dataset_id: str,
    output_path: str,
    progress: Progress,
    task_id: TaskID,
    max_workers: int = 4,
) -> None:
    """
    Download an entire dataset from COS.
    
    Args:
        dataset_id: Dataset ID
        output_path: Local output directory
        progress: Rich progress instance
        task_id: Progress task ID
        max_workers: Number of parallel download workers
    """
    prefix = f"datasets/{dataset_id}/"
    objects = list_objects(prefix)
    
    if not objects:
        raise ValueError(f"No files found for dataset '{dataset_id}'")
    
    total_size = sum(obj["Size"] for obj in objects)
    progress.update(task_id, total=total_size)
    
    downloaded_size = 0
    
    def download_single(obj: dict) -> None:
        nonlocal downloaded_size
        cos_key = obj["Key"]
        # Remove the prefix to get relative path
        rel_path = cos_key[len(prefix):]
        local_path = os.path.join(output_path, rel_path)
        
        download_file(cos_key, local_path)
        downloaded_size += obj["Size"]
        progress.update(task_id, completed=downloaded_size)
    
    # Download files with thread pool
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_single, obj): obj for obj in objects}
        
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                obj = futures[future]
                progress.console.print(f"[red]Failed to download {obj['Key']}: {e}[/red]")


def format_size(size_bytes: int) -> str:
    """Format file size in human-readable format."""
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.2f} PB"
