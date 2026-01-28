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
      likes INTEGER DEFAULT 0,
      updated_at DATE DEFAULT CURRENT_DATE,
      size VARCHAR(50),
      format VARCHAR(50),
      license VARCHAR(100),
      task VARCHAR(255),
      language VARCHAR(100),
      rows BIGINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS dataset_splits (
      id SERIAL PRIMARY KEY,
      dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      rows BIGINT DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS dataset_features (
      id SERIAL PRIMARY KEY,
      dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS dataset_preview_data (
      id SERIAL PRIMARY KEY,
      dataset_id VARCHAR(255) REFERENCES datasets(id) ON DELETE CASCADE,
      data JSONB NOT NULL
    )
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_datasets_task ON datasets(task)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_datasets_format ON datasets(format)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_datasets_license ON datasets(license)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_datasets_updated_at ON datasets(updated_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_datasets_downloads ON datasets(downloads DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dataset_splits_dataset_id ON dataset_splits(dataset_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dataset_features_dataset_id ON dataset_features(dataset_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dataset_preview_data_dataset_id ON dataset_preview_data(dataset_id)`;

  console.log("Tables created successfully!");
}

async function seedData() {
  console.log("Seeding data...");

  // Check if data already exists
  const existing = await sql`SELECT COUNT(*) as count FROM datasets`;
  if (Number(existing[0].count) > 0) {
    console.log("Data already exists, skipping seed...");
    return;
  }

  for (const dataset of datasets) {
    console.log(`Inserting dataset: ${dataset.name}`);

    await sql`
      INSERT INTO datasets (id, name, author, description, tags, downloads, likes, updated_at, size, format, license, task, language, rows)
      VALUES (
        ${dataset.id},
        ${dataset.name},
        ${dataset.author},
        ${dataset.description},
        ${dataset.tags},
        ${dataset.downloads},
        ${dataset.likes},
        ${dataset.updatedAt},
        ${dataset.size},
        ${dataset.format},
        ${dataset.license},
        ${dataset.task},
        ${dataset.language || null},
        ${dataset.rows || 0}
      )
    `;

    // Insert splits
    if (dataset.splits) {
      for (const split of dataset.splits) {
        await sql`
          INSERT INTO dataset_splits (dataset_id, name, rows)
          VALUES (${dataset.id}, ${split.name}, ${split.rows})
        `;
      }
    }

    // Insert features
    if (dataset.features) {
      for (const feature of dataset.features) {
        await sql`
          INSERT INTO dataset_features (dataset_id, name, type)
          VALUES (${dataset.id}, ${feature.name}, ${feature.type})
        `;
      }
    }

    // Insert preview data
    if (dataset.previewData) {
      for (const data of dataset.previewData) {
        await sql`
          INSERT INTO dataset_preview_data (dataset_id, data)
          VALUES (${dataset.id}, ${JSON.stringify(data)})
        `;
      }
    }
  }

  console.log("Data seeded successfully!");
}

async function main() {
  try {
    await createTables();
    await seedData();
    console.log("Database initialization completed!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

main();
