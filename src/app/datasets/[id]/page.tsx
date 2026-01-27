import { notFound } from "next/navigation";
import { getDatasetById, datasets, formatNumber } from "@/data/datasets";
import { DatasetDetailClient } from "./dataset-detail-client";

interface DatasetPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return datasets.map((dataset) => ({
    id: dataset.id,
  }));
}

export async function generateMetadata({ params }: DatasetPageProps) {
  const { id } = await params;
  const dataset = getDatasetById(id);

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
  const dataset = getDatasetById(id);

  if (!dataset) {
    notFound();
  }

  return <DatasetDetailClient dataset={dataset} />;
}
