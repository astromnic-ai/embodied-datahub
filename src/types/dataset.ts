export interface Dataset {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  downloads: number;
  likes: number;
  updatedAt: string;
  size: string;
  format: string;
  license: string;
  task: string;
  language?: string;
  rows?: number;
  splits?: {
    name: string;
    rows: number;
  }[];
  features?: {
    name: string;
    type: string;
  }[];
  previewData?: Record<string, unknown>[];
}

export interface FilterOptions {
  tasks: string[];
  sizes: string[];
  formats: string[];
  licenses: string[];
  languages: string[];
}
