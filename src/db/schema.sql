-- Embodied DataHub Database Schema for LeRobot/Corobot Datasets

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    downloads INTEGER DEFAULT 0,
    updated_at DATE DEFAULT CURRENT_DATE,
    size VARCHAR(50),
    license VARCHAR(100),
    
    -- Dataset format: 'lerobot' or 'corobot'
    dataset_format VARCHAR(50) NOT NULL DEFAULT 'lerobot',
    
    -- Robot and task information
    robot_type VARCHAR(255),
    task_type VARCHAR(255),
    
    -- Episode information
    total_episodes INTEGER DEFAULT 0,
    total_frames BIGINT DEFAULT 0,
    fps INTEGER DEFAULT 30,
    
    -- Action space (stored as JSON)
    action_space_type VARCHAR(50) DEFAULT 'continuous',
    action_space_dimensions INTEGER DEFAULT 0,
    action_space_description TEXT,
    
    -- Environment
    environment VARCHAR(255),
    simulation_framework VARCHAR(255),
    
    -- README content
    readme TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Observation types table
CREATE TABLE IF NOT EXISTS observation_types (
    id SERIAL PRIMARY KEY,
    dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    shape VARCHAR(100),
    description TEXT
);

-- Episode previews table
CREATE TABLE IF NOT EXISTS episode_previews (
    id SERIAL PRIMARY KEY,
    dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
    episode_id INTEGER NOT NULL,
    length INTEGER NOT NULL,
    success BOOLEAN,
    reward FLOAT,
    task VARCHAR(255)
);

-- Dataset files table
CREATE TABLE IF NOT EXISTS dataset_files (
    id SERIAL PRIMARY KEY,
    dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    path VARCHAR(1000) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'parquet', 'json', 'mp4', 'other'
    size VARCHAR(50),
    preview_data JSONB, -- For parquet and json preview
    video_url VARCHAR(1000), -- For mp4 files
    oss_url VARCHAR(1000) -- COS download URL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_datasets_dataset_format ON datasets(dataset_format);
CREATE INDEX IF NOT EXISTS idx_datasets_robot_type ON datasets(robot_type);
CREATE INDEX IF NOT EXISTS idx_datasets_task_type ON datasets(task_type);
CREATE INDEX IF NOT EXISTS idx_datasets_license ON datasets(license);
CREATE INDEX IF NOT EXISTS idx_datasets_updated_at ON datasets(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_datasets_downloads ON datasets(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_observation_types_dataset_id ON observation_types(dataset_id);
CREATE INDEX IF NOT EXISTS idx_episode_previews_dataset_id ON episode_previews(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_files_dataset_id ON dataset_files(dataset_id);

-- Migration: Remove git columns if they exist (run manually if needed)
-- ALTER TABLE datasets DROP COLUMN IF EXISTS repo_url;
-- ALTER TABLE datasets DROP COLUMN IF EXISTS git_clone_url;
