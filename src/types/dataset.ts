export interface Dataset {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  downloads: number;
  updatedAt: string;
  size: string;
  license: string;
  
  // Dataset format: LeRobot or Corobot
  datasetFormat: "lerobot" | "corobot";
  
  // Robot and task information
  robotType: string;
  taskType: string;
  
  // Episode information
  totalEpisodes: number;
  totalFrames: number;
  fps: number;
  
  // Observation space
  observationTypes: ObservationType[];
  
  // Action space
  actionSpace: ActionSpace;
  
  // Environment
  environment?: string;
  simulationFramework?: string;
  
  // Preview data
  episodes?: EpisodePreview[];
  
  // Dataset files for preview
  files?: DatasetFile[];
  
  // README content (markdown)
  readme?: string;
  
  // Git repository information (optional)
  gitCloneUrl?: string;
  repoUrl?: string;
}

export interface ObservationType {
  name: string;
  type: "image" | "depth" | "state" | "pointcloud" | "audio" | "other";
  shape?: string;
  description?: string;
}

export interface ActionSpace {
  type: "continuous" | "discrete" | "mixed";
  dimensions: number;
  description?: string;
}

export interface EpisodePreview {
  episodeId: number;
  length: number;
  success?: boolean;
  reward?: number;
  task?: string;
}

export type FileType = "parquet" | "json" | "mp4" | "md" | "other";

export interface DatasetFile {
  name: string;
  path: string;
  type: FileType;
  size: string;
  // Preview content (for parquet and json)
  previewData?: ParquetPreview | JsonPreview | null;
  // Video URL (for mp4)
  videoUrl?: string;
  // COS download URL
  ossUrl?: string;
}

// File tree types for folder-based navigation
export interface FileTreeItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: string;
  type?: FileType;
  childCount?: number; // Number of children for directories
}

// File preview response from API
export interface FilePreviewResponse {
  type: FileType;
  content?: string; // For json, md files
  parquetPreview?: ParquetPreview; // For parquet files
  videoUrl?: string; // For mp4 files
  truncated?: boolean; // Whether content was truncated
  error?: string;
}

export interface FileTreeResponse {
  items: FileTreeItem[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount: number;
}

export interface ParquetPreview {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

export interface JsonPreview {
  content: Record<string, unknown> | unknown[];
  truncated: boolean;
}

export interface FilterOptions {
  datasetFormats: string[];
  robotTypes: string[];
  taskTypes: string[];
  observationTypes: string[];
  licenses: string[];
}
