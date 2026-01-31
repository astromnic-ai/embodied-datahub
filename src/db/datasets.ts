import { sql } from "./index";
import { Dataset, ObservationType, EpisodePreview, ActionSpace, DatasetFile, FileTreeItem, FileTreeResponse, FileType } from "@/types/dataset";

// Helper to detect file type from filename
function detectFileType(filename: string): FileType {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "parquet":
      return "parquet";
    case "json":
      return "json";
    case "mp4":
      return "mp4";
    case "md":
    case "markdown":
      return "md";
    default:
      return "other";
  }
}

interface DbDataset {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  downloads: number;
  updated_at: string;
  size: string;
  license: string;
  dataset_format: "lerobot" | "corobot";
  robot_type: string;
  task_type: string;
  total_episodes: number;
  total_frames: number;
  fps: number;
  action_space_type: string;
  action_space_dimensions: number;
  action_space_description: string | null;
  environment: string | null;
  simulation_framework: string | null;
  readme: string | null;
}

interface DbObservationType {
  name: string;
  type: string;
  shape: string | null;
  description: string | null;
}

interface DbEpisodePreview {
  episode_id: number;
  length: number;
  success: boolean | null;
  reward: number | null;
  task: string | null;
}

interface DbDatasetFile {
  name: string;
  path: string;
  type: string;
  size: string | null;
  preview_data: unknown | null;
  video_url: string | null;
  oss_url: string | null;
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

async function getDatasetRelations(datasetId: string) {
  const [observationTypes, episodes, files] = await Promise.all([
    sql`SELECT name, type, shape, description FROM observation_types WHERE dataset_id = ${datasetId}`,
    sql`SELECT episode_id, length, success, reward, task FROM episode_previews WHERE dataset_id = ${datasetId} ORDER BY episode_id LIMIT 10`,
    sql`SELECT name, path, type, size, preview_data, video_url, oss_url FROM dataset_files WHERE dataset_id = ${datasetId}`,
  ]);

  return {
    observationTypes: (observationTypes as DbObservationType[]).map((o) => ({
      name: o.name,
      type: o.type as ObservationType["type"],
      shape: o.shape || undefined,
      description: o.description || undefined,
    })),
    episodes: (episodes as DbEpisodePreview[]).map((e) => ({
      episodeId: e.episode_id,
      length: e.length,
      success: e.success ?? undefined,
      reward: e.reward ?? undefined,
      task: e.task || undefined,
    })),
    files: (files as DbDatasetFile[]).map((f) => ({
      name: f.name,
      path: f.path,
      type: f.type as DatasetFile["type"],
      size: f.size || "",
      previewData: f.preview_data as DatasetFile["previewData"],
      videoUrl: f.video_url || undefined,
      ossUrl: f.oss_url || undefined,
    })),
  };
}

function mapDbToDataset(
  row: DbDataset,
  relations?: {
    observationTypes: ObservationType[];
    episodes: EpisodePreview[];
    files: DatasetFile[];
  }
): Dataset {
  return {
    id: row.id,
    name: row.name,
    author: row.author,
    description: row.description,
    tags: row.tags || [],
    downloads: Number(row.downloads),
    updatedAt: formatDate(row.updated_at),
    size: row.size,
    license: row.license,
    datasetFormat: row.dataset_format,
    robotType: row.robot_type,
    taskType: row.task_type,
    totalEpisodes: Number(row.total_episodes),
    totalFrames: Number(row.total_frames),
    fps: Number(row.fps),
    actionSpace: {
      type: row.action_space_type as ActionSpace["type"],
      dimensions: Number(row.action_space_dimensions),
      description: row.action_space_description || undefined,
    },
    environment: row.environment || undefined,
    simulationFramework: row.simulation_framework || undefined,
    observationTypes: relations?.observationTypes || [],
    episodes: relations?.episodes,
    files: relations?.files,
    readme: row.readme || undefined,
  };
}

export async function getAllDatasets(): Promise<Dataset[]> {
  const rows = await sql`
    SELECT id, name, author, description, tags, downloads, 
           updated_at, size, license, dataset_format, robot_type, task_type,
           total_episodes, total_frames, fps, action_space_type,
           action_space_dimensions, action_space_description,
           environment, simulation_framework, readme
    FROM datasets
    ORDER BY updated_at DESC
  `;

  // Get observation types for all datasets
  const datasetsWithRelations = await Promise.all(
    (rows as DbDataset[]).map(async (row) => {
      const observationTypes = await sql`
        SELECT name, type, shape, description 
        FROM observation_types 
        WHERE dataset_id = ${row.id}
      `;
      return mapDbToDataset(row, {
        observationTypes: (observationTypes as DbObservationType[]).map((o) => ({
          name: o.name,
          type: o.type as ObservationType["type"],
          shape: o.shape || undefined,
          description: o.description || undefined,
        })),
        episodes: [],
        files: [],
      });
    })
  );

  return datasetsWithRelations;
}

export async function getDatasetById(id: string): Promise<Dataset | null> {
  const rows = await sql`
    SELECT id, name, author, description, tags, downloads,
           updated_at, size, license, dataset_format, robot_type, task_type,
           total_episodes, total_frames, fps, action_space_type,
           action_space_dimensions, action_space_description,
           environment, simulation_framework, readme
    FROM datasets
    WHERE id = ${id}
  `;

  if (rows.length === 0) return null;

  const relations = await getDatasetRelations(id);
  return mapDbToDataset(rows[0] as DbDataset, relations);
}

export async function createDataset(
  dataset: Partial<Dataset> & { id?: string }
): Promise<Dataset> {
  const id = dataset.id ||
    dataset.name!
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${Date.now()}`;

  await sql`
    INSERT INTO datasets (
      id, name, author, description, tags, downloads, updated_at,
      size, license, dataset_format, robot_type, task_type,
      total_episodes, total_frames, fps, action_space_type,
      action_space_dimensions, action_space_description,
      environment, simulation_framework, readme
    )
    VALUES (
      ${id},
      ${dataset.name || ""},
      ${dataset.author || ""},
      ${dataset.description || ""},
      ${dataset.tags || []},
      ${dataset.downloads || 0},
      ${dataset.updatedAt || new Date().toISOString().split("T")[0]},
      ${dataset.size || ""},
      ${dataset.license || "MIT"},
      ${dataset.datasetFormat || "lerobot"},
      ${dataset.robotType || ""},
      ${dataset.taskType || ""},
      ${dataset.totalEpisodes || 0},
      ${dataset.totalFrames || 0},
      ${dataset.fps || 30},
      ${dataset.actionSpace?.type || "continuous"},
      ${dataset.actionSpace?.dimensions || 0},
      ${dataset.actionSpace?.description || null},
      ${dataset.environment || null},
      ${dataset.simulationFramework || null},
      ${dataset.readme || null}
    )
  `;

  // Insert observation types
  if (dataset.observationTypes && dataset.observationTypes.length > 0) {
    for (const obs of dataset.observationTypes) {
      await sql`
        INSERT INTO observation_types (dataset_id, name, type, shape, description)
        VALUES (${id}, ${obs.name}, ${obs.type}, ${obs.shape || null}, ${obs.description || null})
      `;
    }
  }

  // Insert episode previews
  if (dataset.episodes && dataset.episodes.length > 0) {
    for (const ep of dataset.episodes) {
      await sql`
        INSERT INTO episode_previews (dataset_id, episode_id, length, success, reward, task)
        VALUES (${id}, ${ep.episodeId}, ${ep.length}, ${ep.success ?? null}, ${ep.reward ?? null}, ${ep.task || null})
      `;
    }
  }

  // Insert files
  if (dataset.files && dataset.files.length > 0) {
    for (const file of dataset.files) {
      await sql`
        INSERT INTO dataset_files (dataset_id, name, path, type, size, preview_data, video_url, oss_url)
        VALUES (${id}, ${file.name}, ${file.path}, ${file.type}, ${file.size || null}, ${file.previewData ? JSON.stringify(file.previewData) : null}, ${file.videoUrl || null}, ${file.ossUrl || null})
      `;
    }
  }

  return (await getDatasetById(id))!;
}

export async function updateDataset(
  id: string,
  updates: Partial<Dataset> & { files?: DatasetFile[] | null }
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
      updated_at = ${updates.updatedAt ?? new Date().toISOString().split("T")[0]},
      size = ${updates.size ?? existing.size},
      license = ${updates.license ?? existing.license},
      dataset_format = ${updates.datasetFormat ?? existing.datasetFormat},
      robot_type = ${updates.robotType ?? existing.robotType},
      task_type = ${updates.taskType ?? existing.taskType},
      total_episodes = ${updates.totalEpisodes ?? existing.totalEpisodes},
      total_frames = ${updates.totalFrames ?? existing.totalFrames},
      fps = ${updates.fps ?? existing.fps},
      action_space_type = ${updates.actionSpace?.type ?? existing.actionSpace.type},
      action_space_dimensions = ${updates.actionSpace?.dimensions ?? existing.actionSpace.dimensions},
      action_space_description = ${updates.actionSpace?.description ?? existing.actionSpace.description ?? null},
      environment = ${updates.environment ?? existing.environment ?? null},
      simulation_framework = ${updates.simulationFramework ?? existing.simulationFramework ?? null},
      readme = ${updates.readme ?? existing.readme ?? null}
    WHERE id = ${id}
  `;

  // Update observation types if provided
  if (updates.observationTypes) {
    await sql`DELETE FROM observation_types WHERE dataset_id = ${id}`;
    for (const obs of updates.observationTypes) {
      await sql`
        INSERT INTO observation_types (dataset_id, name, type, shape, description)
        VALUES (${id}, ${obs.name}, ${obs.type}, ${obs.shape || null}, ${obs.description || null})
      `;
    }
  }

  // Update episode previews if provided
  if (updates.episodes) {
    await sql`DELETE FROM episode_previews WHERE dataset_id = ${id}`;
    for (const ep of updates.episodes) {
      await sql`
        INSERT INTO episode_previews (dataset_id, episode_id, length, success, reward, task)
        VALUES (${id}, ${ep.episodeId}, ${ep.length}, ${ep.success ?? null}, ${ep.reward ?? null}, ${ep.task || null})
      `;
    }
  }

  // Update files if provided
  if (updates.files !== undefined) {
    // IMPORTANT: treat [] as "no change" to avoid accidentally wiping files when
    // admin/editor forms submit an empty array without actually intending to update files.
    // To explicitly clear files, pass `files: null`.
    if (updates.files === null) {
      await sql`DELETE FROM dataset_files WHERE dataset_id = ${id}`;
    } else if (Array.isArray(updates.files) && updates.files.length > 0) {
      await sql`DELETE FROM dataset_files WHERE dataset_id = ${id}`;
      for (const file of updates.files) {
        await sql`
          INSERT INTO dataset_files (dataset_id, name, path, type, size, preview_data, video_url, oss_url)
          VALUES (${id}, ${file.name}, ${file.path}, ${file.type}, ${file.size || null}, ${file.previewData ? JSON.stringify(file.previewData) : null}, ${file.videoUrl || null}, ${file.ossUrl || null})
        `;
      }
    }
  }

  return getDatasetById(id);
}

export async function deleteDataset(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM datasets WHERE id = ${id} RETURNING id
  `;
  return result.length > 0;
}

/**
 * Get file tree for a dataset at a specific path
 * Supports pagination with cursor-based navigation
 * 
 * @param datasetId - The dataset ID
 * @param path - The folder path (empty string for root)
 * @param limit - Number of items per page
 * @param cursor - Cursor for pagination (the last item's path from previous page)
 */
export async function getFileTree(
  datasetId: string,
  path: string = "",
  limit: number = 50,
  cursor?: string
): Promise<FileTreeResponse> {
  // Normalize path: ensure it ends with / if not empty, and doesn't start with /
  const normalizedPath = path ? (path.endsWith("/") ? path : path + "/") : "";
  const pathPrefix = normalizedPath;
  
  // Query to get files at this path level
  // We need to:
  // 1. Find all files that start with the prefix
  // 2. Group them into immediate children (files and folders)
  // 3. For folders, count the number of children
  
  // First, get all files under this path
  const allFiles = await sql`
    SELECT path, name, type, size, oss_url
    FROM dataset_files
    WHERE dataset_id = ${datasetId}
    AND path LIKE ${pathPrefix + '%'}
    ORDER BY path
  `;
  
  // Build the tree structure from flat file list
  const itemMap = new Map<string, FileTreeItem>();
  const directChildren: FileTreeItem[] = [];
  
  for (const file of allFiles as DbDatasetFile[]) {
    const filePath = file.path;
    const relativePath = pathPrefix ? filePath.slice(pathPrefix.length) : filePath;
    
    // Skip if the path is the prefix itself or starts with cursor
    if (!relativePath) continue;
    
    // Find the first path segment
    const slashIndex = relativePath.indexOf("/");
    
    if (slashIndex === -1) {
      // This is a file directly in this folder
      // Use detectFileType to handle markdown files that might be stored as "other" in db
      const fileType = file.type === "other" ? detectFileType(file.name) : (file.type as FileType);
      const item: FileTreeItem = {
        name: file.name,
        path: filePath,
        isDirectory: false,
        size: file.size || undefined,
        type: fileType,
      };
      
      if (!itemMap.has(filePath)) {
        itemMap.set(filePath, item);
        directChildren.push(item);
      }
    } else {
      // This file is in a subfolder
      const folderName = relativePath.slice(0, slashIndex);
      const folderPath = pathPrefix + folderName;
      
      if (!itemMap.has(folderPath)) {
        const item: FileTreeItem = {
          name: folderName,
          path: folderPath,
          isDirectory: true,
          childCount: 1,
        };
        itemMap.set(folderPath, item);
        directChildren.push(item);
      } else {
        // Increment child count for existing folder
        const existingFolder = itemMap.get(folderPath)!;
        existingFolder.childCount = (existingFolder.childCount || 0) + 1;
      }
    }
  }
  
  // Sort: folders first, then by name
  directChildren.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });
  
  // Apply cursor-based pagination
  let startIndex = 0;
  if (cursor) {
    const cursorIndex = directChildren.findIndex(item => item.path === cursor);
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1;
    }
  }
  
  const paginatedItems = directChildren.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < directChildren.length;
  const nextCursor = hasMore ? paginatedItems[paginatedItems.length - 1]?.path : undefined;
  
  return {
    items: paginatedItems,
    hasMore,
    nextCursor,
    totalCount: directChildren.length,
  };
}
