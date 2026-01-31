# Embodied DataHub CLI

Command-line tool for uploading and downloading robot datasets to Embodied DataHub.

## Installation

```bash
cd cli
pip install -e .
```

Or install dependencies directly:

```bash
pip install -r requirements.txt
```

## Configuration

### 1. Set API URL

```bash
# Set the DataHub API URL
datahub config api http://localhost:3000

# Or for production
datahub config api https://your-datahub-domain.com
```

### 2. Configure Tencent Cloud COS

```bash
datahub config cos
# Follow the prompts to enter:
# - COS Secret ID
# - COS Secret Key
# - COS Region (e.g., ap-shanghai)
# - COS Bucket name
```

Or set environment variables:

```bash
export COS_SECRET_ID=your-secret-id
export COS_SECRET_KEY=your-secret-key
export COS_REGION=ap-shanghai
export COS_BUCKET=your-bucket-name
```

### 3. Login

```bash
datahub login
# Enter your admin username and password
```

## Usage

### List Datasets

```bash
datahub list
```

### View Dataset Info

```bash
datahub info <dataset_id>
```

### Create a Dataset

```bash
datahub create "My Robot Dataset" \
  --author "Your Name" \
  --description "A dataset for robot manipulation" \
  --format lerobot \
  --robot-type "Franka" \
  --task-type "Manipulation"
```

### Upload Files to Dataset

```bash
# Upload an entire folder to a dataset
datahub upload <dataset_id> /path/to/dataset/folder

# With more parallel workers (default: 4)
datahub upload <dataset_id> /path/to/folder --workers 8
```

**Parquet Preview**: When uploading `.parquet` files, the CLI automatically extracts the first 100 rows as preview data. This enables web preview without downloading the entire file.

The folder structure will be preserved. For example:

```
my_dataset/
├── meta/
│   └── info.json
├── data/
│   └── episode_000.parquet
└── videos/
    └── episode_000.mp4
```

Will be uploaded as:

```
datasets/<dataset_id>/meta/info.json
datasets/<dataset_id>/data/episode_000.parquet
datasets/<dataset_id>/videos/episode_000.mp4
```

### Download a Dataset

```bash
# Download to current directory
datahub download <dataset_id>

# Download to specific directory
datahub download <dataset_id> /path/to/output

# With more parallel workers
datahub download <dataset_id> --workers 8
```

### Delete a Dataset

```bash
datahub delete <dataset_id>

# Skip confirmation
datahub delete <dataset_id> --yes
```

## Configuration Files

Configuration is stored in `~/.datahub/`:

- `config.json` - API URL and COS settings
- `credentials.json` - Authentication token (permissions: 600)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATAHUB_API_URL` | DataHub API URL (overrides config) |
| `COS_SECRET_ID` | Tencent COS Secret ID |
| `COS_SECRET_KEY` | Tencent COS Secret Key |
| `COS_REGION` | Tencent COS Region |
| `COS_BUCKET` | Tencent COS Bucket name |

## Examples

### Complete Workflow

```bash
# 1. Configure
datahub config api https://datahub.example.com
datahub config cos

# 2. Login
datahub login

# 3. Create dataset
datahub create "Kitchen Manipulation" \
  --author "Robot Lab" \
  --format lerobot \
  --robot-type "Franka" \
  --task-type "Manipulation"

# 4. Upload data
datahub upload kitchen-manipulation ./my_dataset_folder

# 5. Verify
datahub info kitchen-manipulation
```

### Download and Use

```bash
# Download dataset
datahub download kitchen-manipulation ./datasets

# The dataset will be at ./datasets/kitchen-manipulation/
```
