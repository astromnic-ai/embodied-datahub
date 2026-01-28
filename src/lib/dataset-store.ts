import { Dataset } from "@/types/dataset";
import { datasets as initialDatasets } from "@/data/datasets";

// In-memory store (in production, use a database)
let datasets: Dataset[] = [...initialDatasets];

export function getAllDatasets(): Dataset[] {
  return datasets;
}

export function getDatasetById(id: string): Dataset | undefined {
  return datasets.find((d) => d.id === id);
}

export function createDataset(dataset: Omit<Dataset, "id">): Dataset {
  const id = dataset.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  
  const newDataset: Dataset = {
    ...dataset,
    id: `${id}-${Date.now()}`,
  };
  
  datasets.unshift(newDataset);
  return newDataset;
}

export function updateDataset(id: string, updates: Partial<Dataset>): Dataset | null {
  const index = datasets.findIndex((d) => d.id === id);
  if (index === -1) return null;
  
  datasets[index] = { ...datasets[index], ...updates, id };
  return datasets[index];
}

export function deleteDataset(id: string): boolean {
  const index = datasets.findIndex((d) => d.id === id);
  if (index === -1) return false;
  
  datasets.splice(index, 1);
  return true;
}
