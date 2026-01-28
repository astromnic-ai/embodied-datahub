import { sql } from "./index";
import { Dataset } from "@/types/dataset";

interface DbDataset {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  downloads: number;
  likes: number;
  updated_at: string;
  size: string;
  format: string;
  license: string;
  task: string;
  language: string | null;
  rows: number;
}

interface DbSplit {
  name: string;
  rows: number;
}

interface DbFeature {
  name: string;
  type: string;
}

interface DbPreviewData {
  data: Record<string, unknown>;
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

async function getDatasetRelations(datasetId: string) {
  const [splits, features, previewData] = await Promise.all([
    sql`SELECT name, rows FROM dataset_splits WHERE dataset_id = ${datasetId}`,
    sql`SELECT name, type FROM dataset_features WHERE dataset_id = ${datasetId}`,
    sql`SELECT data FROM dataset_preview_data WHERE dataset_id = ${datasetId}`,
  ]);

  return {
    splits: (splits as DbSplit[]).map((s) => ({ name: s.name, rows: Number(s.rows) })),
    features: features as DbFeature[],
    previewData: (previewData as DbPreviewData[]).map((p) => p.data),
  };
}

function mapDbToDataset(row: DbDataset, relations?: {
  splits: { name: string; rows: number }[];
  features: { name: string; type: string }[];
  previewData: Record<string, unknown>[];
}): Dataset {
  return {
    id: row.id,
    name: row.name,
    author: row.author,
    description: row.description,
    tags: row.tags || [],
    downloads: Number(row.downloads),
    likes: Number(row.likes),
    updatedAt: formatDate(row.updated_at),
    size: row.size,
    format: row.format,
    license: row.license,
    task: row.task,
    language: row.language || undefined,
    rows: Number(row.rows),
    splits: relations?.splits,
    features: relations?.features,
    previewData: relations?.previewData,
  };
}

export async function getAllDatasets(): Promise<Dataset[]> {
  const rows = await sql`
    SELECT id, name, author, description, tags, downloads, likes, 
           updated_at, size, format, license, task, language, rows
    FROM datasets
    ORDER BY updated_at DESC
  `;

  return (rows as DbDataset[]).map((row) => mapDbToDataset(row));
}

export async function getDatasetById(id: string): Promise<Dataset | null> {
  const rows = await sql`
    SELECT id, name, author, description, tags, downloads, likes,
           updated_at, size, format, license, task, language, rows
    FROM datasets
    WHERE id = ${id}
  `;

  if (rows.length === 0) return null;

  const relations = await getDatasetRelations(id);
  return mapDbToDataset(rows[0] as DbDataset, relations);
}

export async function createDataset(
  dataset: Omit<Dataset, "id">
): Promise<Dataset> {
  const id =
    dataset.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${Date.now()}`;

  await sql`
    INSERT INTO datasets (id, name, author, description, tags, downloads, likes, updated_at, size, format, license, task, language, rows)
    VALUES (
      ${id},
      ${dataset.name},
      ${dataset.author},
      ${dataset.description},
      ${dataset.tags || []},
      ${dataset.downloads || 0},
      ${dataset.likes || 0},
      ${dataset.updatedAt || new Date().toISOString().split("T")[0]},
      ${dataset.size || ""},
      ${dataset.format || "parquet"},
      ${dataset.license || "MIT"},
      ${dataset.task || "Other"},
      ${dataset.language || null},
      ${dataset.rows || 0}
    )
  `;

  // Insert splits
  if (dataset.splits && dataset.splits.length > 0) {
    for (const split of dataset.splits) {
      await sql`
        INSERT INTO dataset_splits (dataset_id, name, rows)
        VALUES (${id}, ${split.name}, ${split.rows})
      `;
    }
  }

  // Insert features
  if (dataset.features && dataset.features.length > 0) {
    for (const feature of dataset.features) {
      await sql`
        INSERT INTO dataset_features (dataset_id, name, type)
        VALUES (${id}, ${feature.name}, ${feature.type})
      `;
    }
  }

  // Insert preview data
  if (dataset.previewData && dataset.previewData.length > 0) {
    for (const data of dataset.previewData) {
      await sql`
        INSERT INTO dataset_preview_data (dataset_id, data)
        VALUES (${id}, ${JSON.stringify(data)})
      `;
    }
  }

  return (await getDatasetById(id))!;
}

export async function updateDataset(
  id: string,
  updates: Partial<Dataset>
): Promise<Dataset | null> {
  const existing = await getDatasetById(id);
  if (!existing) return null;

  await sql`
    UPDATE datasets SET
      name = ${updates.name ?? existing.name},
      author = ${updates.author ?? existing.author},
      description = ${updates.description ?? existing.description},
      tags = ${updates.tags ?? existing.tags},
      downloads = ${updates.downloads ?? existing.downloads},
      likes = ${updates.likes ?? existing.likes},
      updated_at = ${updates.updatedAt ?? new Date().toISOString().split("T")[0]},
      size = ${updates.size ?? existing.size},
      format = ${updates.format ?? existing.format},
      license = ${updates.license ?? existing.license},
      task = ${updates.task ?? existing.task},
      language = ${updates.language ?? existing.language ?? null},
      rows = ${updates.rows ?? existing.rows}
    WHERE id = ${id}
  `;

  // Update splits if provided
  if (updates.splits) {
    await sql`DELETE FROM dataset_splits WHERE dataset_id = ${id}`;
    for (const split of updates.splits) {
      await sql`
        INSERT INTO dataset_splits (dataset_id, name, rows)
        VALUES (${id}, ${split.name}, ${split.rows})
      `;
    }
  }

  // Update features if provided
  if (updates.features) {
    await sql`DELETE FROM dataset_features WHERE dataset_id = ${id}`;
    for (const feature of updates.features) {
      await sql`
        INSERT INTO dataset_features (dataset_id, name, type)
        VALUES (${id}, ${feature.name}, ${feature.type})
      `;
    }
  }

  // Update preview data if provided
  if (updates.previewData) {
    await sql`DELETE FROM dataset_preview_data WHERE dataset_id = ${id}`;
    for (const data of updates.previewData) {
      await sql`
        INSERT INTO dataset_preview_data (dataset_id, data)
        VALUES (${id}, ${JSON.stringify(data)})
      `;
    }
  }

  return getDatasetById(id);
}

export async function deleteDataset(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM datasets WHERE id = ${id}
  `;
  return result.count > 0;
}
