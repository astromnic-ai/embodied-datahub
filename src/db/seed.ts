import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { datasets } from "../data/datasets";

// Load environment variables from .env.local
config({ path: ".env.local" });

const DATABASE_URL = process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error("POSTGRES_URL environment variable is not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function dropTables() {
  console.log("Dropping existing tables...");
  await sql`DROP TABLE IF EXISTS dataset_files CASCADE`;
  await sql`DROP TABLE IF EXISTS episode_previews CASCADE`;
  await sql`DROP TABLE IF EXISTS observation_types CASCADE`;
  await sql`DROP TABLE IF EXISTS dataset_preview_data CASCADE`;
  await sql`DROP TABLE IF EXISTS dataset_features CASCADE`;
  await sql`DROP TABLE IF EXISTS dataset_splits CASCADE`;
  await sql`DROP TABLE IF EXISTS datasets CASCADE`;
  console.log("Tables dropped.");
}

async function createTables() {
  console.log("Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS datasets (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(500) NOT NULL,
      author VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      tags TEXT[] DEFAULT '{}',
      downloads INTEGER DEFAULT 0,
      updated_at DATE DEFAULT CURRENT_DATE,
      size VARCHAR(50),
      license VARCHAR(100),
      dataset_format VARCHAR(50) NOT NULL DEFAULT 'lerobot',
      robot_type VARCHAR(255),
      task_type VARCHAR(255),
      total_episodes INTEGER DEFAULT 0,
      total_frames BIGINT DEFAULT 0,
      fps INTEGER DEFAULT 30,
      action_space_type VARCHAR(50) DEFAULT 'continuous',
      action_space_dimensions INTEGER DEFAULT 0,
      action_space_description TEXT,
      environment VARCHAR(255),
      simulation_framework VARCHAR(255),
      repo_url VARCHAR(1000),
      git_clone_url VARCHAR(1000),
      readme TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS observation_types (
      id SERIAL PRIMARY KEY,
      dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      shape VARCHAR(100),
      description TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS episode_previews (
      id SERIAL PRIMARY KEY,
      dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
      episode_id INTEGER NOT NULL,
      length INTEGER NOT NULL,
      success BOOLEAN,
      reward FLOAT,
      task VARCHAR(255)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS dataset_files (
      id SERIAL PRIMARY KEY,
      dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
      name VARCHAR(500) NOT NULL,
      path VARCHAR(1000) NOT NULL,
      type VARCHAR(50) NOT NULL,
      size VARCHAR(50),
      preview_data JSONB,
      video_url VARCHAR(1000),
      oss_url VARCHAR(1000)
    )
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_datasets_dataset_format ON datasets(dataset_format)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_datasets_robot_type ON datasets(robot_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_datasets_task_type ON datasets(task_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_datasets_license ON datasets(license)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_datasets_updated_at ON datasets(updated_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_datasets_downloads ON datasets(downloads DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_observation_types_dataset_id ON observation_types(dataset_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_episode_previews_dataset_id ON episode_previews(dataset_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dataset_files_dataset_id ON dataset_files(dataset_id)`;

  console.log("Tables created successfully!");
}

async function seedData() {
  console.log("Seeding data...");

  for (const dataset of datasets) {
    console.log(`Inserting dataset: ${dataset.name}`);

    await sql`
      INSERT INTO datasets (
        id, name, author, description, tags, downloads, updated_at,
        size, license, dataset_format, robot_type, task_type,
        total_episodes, total_frames, fps, action_space_type,
        action_space_dimensions, action_space_description,
        environment, simulation_framework
      )
      VALUES (
        ${dataset.id},
        ${dataset.name},
        ${dataset.author},
        ${dataset.description},
        ${dataset.tags},
        ${dataset.downloads},
        ${dataset.updatedAt},
        ${dataset.size},
        ${dataset.license},
        ${dataset.datasetFormat},
        ${dataset.robotType},
        ${dataset.taskType},
        ${dataset.totalEpisodes},
        ${dataset.totalFrames},
        ${dataset.fps},
        ${dataset.actionSpace?.type || 'continuous'},
        ${dataset.actionSpace?.dimensions || 0},
        ${dataset.actionSpace?.description || null},
        ${dataset.environment || null},
        ${dataset.simulationFramework || null}
      )
    `;

    // Insert observation types
    if (dataset.observationTypes) {
      for (const obs of dataset.observationTypes) {
        await sql`
          INSERT INTO observation_types (dataset_id, name, type, shape, description)
          VALUES (${dataset.id}, ${obs.name}, ${obs.type}, ${obs.shape || null}, ${obs.description || null})
        `;
      }
    }

    // Insert episode previews
    if (dataset.episodes) {
      for (const ep of dataset.episodes) {
        await sql`
          INSERT INTO episode_previews (dataset_id, episode_id, length, success, reward, task)
          VALUES (${dataset.id}, ${ep.episodeId}, ${ep.length}, ${ep.success ?? null}, ${ep.reward ?? null}, ${ep.task || null})
        `;
      }
    }

    // Insert files
    if (dataset.files) {
      for (const file of dataset.files) {
        await sql`
          INSERT INTO dataset_files (dataset_id, name, path, type, size, preview_data, video_url)
          VALUES (${dataset.id}, ${file.name}, ${file.path}, ${file.type}, ${file.size || null}, ${file.previewData ? JSON.stringify(file.previewData) : null}, ${file.videoUrl || null})
        `;
      }
    }
  }

  console.log("Data seeded successfully!");
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const shouldReset = args.includes("--reset");

    if (shouldReset) {
      await dropTables();
    }

    await createTables();
    
    // Check if data already exists
    const existing = await sql`SELECT COUNT(*) as count FROM datasets`;
    if (Number(existing[0].count) > 0 && !shouldReset) {
      console.log("Data already exists. Use --reset flag to recreate tables.");
      return;
    }

    await seedData();
    console.log("Database initialization completed!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

main();
