import { notFound } from "next/navigation";
import { DatasetDetailClient } from "./dataset-detail-client";

interface DatasetPageProps {
  params: Promise<{ id: string }>;
}

async function getDataset(id: string) {
  // In production, use absolute URL or environment variable
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
  
  try {
    const res = await fetch(`${baseUrl}/api/datasets/${id}`, {
      cache: "no-store",
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: DatasetPageProps) {
  const { id } = await params;
  const dataset = await getDataset(id);

  if (!dataset) {
    return {
      title: "Dataset Not Found",
    };
  }

  return {
    title: `${dataset.name} - Embodied DataHub`,
    description: dataset.description,
  };
}

export default async function DatasetPage({ params }: DatasetPageProps) {
  const { id } = await params;
  const dataset = await getDataset(id);

  if (!dataset) {
    notFound();
  }

  return <DatasetDetailClient dataset={dataset} />;
}
