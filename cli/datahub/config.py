"""Configuration management for DataHub CLI."""

import json
import os
from pathlib import Path
from typing import Optional

# Default config directory
CONFIG_DIR = Path.home() / ".datahub"
CONFIG_FILE = CONFIG_DIR / "config.json"
CREDENTIALS_FILE = CONFIG_DIR / "credentials.json"


def ensure_config_dir():
    """Ensure the config directory exists."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)


def load_config() -> dict:
    """Load configuration from file."""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    return {}


def save_config(config: dict):
    """Save configuration to file."""
    ensure_config_dir()
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)


def get_api_url() -> str:
    """Get the API URL from config or environment."""
    config = load_config()
    return os.environ.get("DATAHUB_API_URL", config.get("api_url", "http://localhost:3000"))


def set_api_url(url: str):
    """Set the API URL in config."""
    config = load_config()
    config["api_url"] = url.rstrip("/")
    save_config(config)


def load_credentials() -> dict:
    """Load credentials from file."""
    if CREDENTIALS_FILE.exists():
        with open(CREDENTIALS_FILE, "r") as f:
            return json.load(f)
    return {}


def save_credentials(credentials: dict):
    """Save credentials to file."""
    ensure_config_dir()
    # Set restrictive permissions on credentials file
    with open(CREDENTIALS_FILE, "w") as f:
        json.dump(credentials, f, indent=2)
    os.chmod(CREDENTIALS_FILE, 0o600)


def get_token() -> Optional[str]:
    """Get the authentication token."""
    credentials = load_credentials()
    return credentials.get("token")


def set_token(token: str):
    """Set the authentication token."""
    credentials = load_credentials()
    credentials["token"] = token
    save_credentials(credentials)


def clear_token():
    """Clear the authentication token."""
    credentials = load_credentials()
    credentials.pop("token", None)
    save_credentials(credentials)


def get_cos_config() -> dict:
    """Get Tencent COS configuration from environment or config."""
    config = load_config()
    return {
        "secret_id": os.environ.get("COS_SECRET_ID", config.get("cos_secret_id", "")),
        "secret_key": os.environ.get("COS_SECRET_KEY", config.get("cos_secret_key", "")),
        "region": os.environ.get("COS_REGION", config.get("cos_region", "ap-shanghai")),
        "bucket": os.environ.get("COS_BUCKET", config.get("cos_bucket", "")),
    }


def set_cos_config(secret_id: str, secret_key: str, region: str, bucket: str):
    """Set Tencent COS configuration."""
    config = load_config()
    config["cos_secret_id"] = secret_id
    config["cos_secret_key"] = secret_key
    config["cos_region"] = region
    config["cos_bucket"] = bucket
    save_config(config)
