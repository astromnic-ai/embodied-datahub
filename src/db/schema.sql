-- Embodied DataHub Database Schema

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    updated_at DATE DEFAULT CURRENT_DATE,
    size VARCHAR(50),
    format VARCHAR(50),
    license VARCHAR(100),
    task VARCHAR(255),
    language VARCHAR(100),
    rows BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dataset splits table
CREATE TABLE IF NOT EXISTS dataset_splits (
    id SERIAL PRIMARY KEY,
    dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    rows BIGINT DEFAULT 0
);

-- Dataset features table
CREATE TABLE IF NOT EXISTS dataset_features (
    id SERIAL PRIMARY KEY,
    dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL
);

-- Dataset preview data table (stores JSON)
CREATE TABLE IF NOT EXISTS dataset_preview_data (
    id SERIAL PRIMARY KEY,
    dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
    data JSONB NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_datasets_task ON datasets(task);
CREATE INDEX IF NOT EXISTS idx_datasets_format ON datasets(format);
CREATE INDEX IF NOT EXISTS idx_datasets_license ON datasets(license);
CREATE INDEX IF NOT EXISTS idx_datasets_updated_at ON datasets(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_datasets_downloads ON datasets(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_dataset_splits_dataset_id ON dataset_splits(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_features_dataset_id ON dataset_features(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_preview_data_dataset_id ON dataset_preview_data(dataset_id);
