"""Parquet file preview extraction for DataHub CLI."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import pyarrow.parquet as pq
    PYARROW_AVAILABLE = True
except ImportError:
    PYARROW_AVAILABLE = False


def is_parquet_file(file_path: str) -> bool:
    """Check if a file is a parquet file."""
    return file_path.lower().endswith(".parquet")


def extract_parquet_preview(
    file_path: str,
    max_rows: int = 100,
    max_columns: int = 50,
) -> Optional[Dict[str, Any]]:
    """
    Extract preview data from a parquet file.
    
    Args:
        file_path: Path to the parquet file
        max_rows: Maximum number of rows to extract (default: 100)
        max_columns: Maximum number of columns to include (default: 50)
        
    Returns:
        Dictionary with columns, rows, and totalRows, or None if extraction fails
    """
    if not PYARROW_AVAILABLE:
        return None
    
    try:
        # Read parquet file metadata first
        parquet_file = pq.ParquetFile(file_path)
        total_rows = parquet_file.metadata.num_rows
        
        # Get schema columns
        schema = parquet_file.schema_arrow
        all_columns = [field.name for field in schema]
        
        # Limit columns if too many
        columns_to_read = all_columns[:max_columns]
        
        # Read only the rows we need
        table = parquet_file.read_row_groups(
            [0] if parquet_file.num_row_groups > 0 else [],
            columns=columns_to_read,
        )
        
        # If first row group has more than max_rows, slice it
        if table.num_rows > max_rows:
            table = table.slice(0, max_rows)
        
        # If first row group is smaller than max_rows and there are more row groups,
        # read additional row groups
        if table.num_rows < max_rows and parquet_file.num_row_groups > 1:
            rows_needed = max_rows - table.num_rows
            for i in range(1, parquet_file.num_row_groups):
                if rows_needed <= 0:
                    break
                additional = parquet_file.read_row_group(i, columns=columns_to_read)
                if additional.num_rows > rows_needed:
                    additional = additional.slice(0, rows_needed)
                table = pq.concat_tables([table, additional])
                rows_needed -= additional.num_rows
        
        # Convert to Python objects
        rows: List[Dict[str, Any]] = []
        for i in range(table.num_rows):
            row = {}
            for col_name in columns_to_read:
                column = table.column(col_name)
                value = column[i].as_py()
                # Handle special types for JSON serialization
                row[col_name] = _serialize_value(value)
            rows.append(row)
        
        return {
            "columns": columns_to_read,
            "rows": rows,
            "totalRows": total_rows,
        }
        
    except Exception as e:
        # Log error but don't fail the upload
        print(f"Warning: Failed to extract parquet preview from {file_path}: {e}")
        return None


def _serialize_value(value: Any) -> Any:
    """
    Serialize a value for JSON compatibility.
    Handles special types like bytes, datetime, etc.
    """
    if value is None:
        return None
    
    # Handle bytes
    if isinstance(value, bytes):
        try:
            return value.decode("utf-8")
        except UnicodeDecodeError:
            return f"<binary: {len(value)} bytes>"
    
    # Handle lists/arrays
    if isinstance(value, (list, tuple)):
        # For large arrays, truncate
        if len(value) > 100:
            return [_serialize_value(v) for v in value[:100]] + [f"... ({len(value) - 100} more)"]
        return [_serialize_value(v) for v in value]
    
    # Handle dicts
    if isinstance(value, dict):
        return {k: _serialize_value(v) for k, v in value.items()}
    
    # Handle datetime/date/time
    if hasattr(value, "isoformat"):
        return value.isoformat()
    
    # Handle numpy types
    if hasattr(value, "item"):
        return value.item()
    
    # Try JSON serialization
    try:
        json.dumps(value)
        return value
    except (TypeError, ValueError):
        return str(value)


def check_pyarrow_available() -> bool:
    """Check if PyArrow is available for parquet processing."""
    return PYARROW_AVAILABLE
