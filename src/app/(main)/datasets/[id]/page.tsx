import { notFound } from "next/navigation";
import { getDatasetById } from "@/db/datasets";
import { getFileContentWithLimit } from "@/lib/oss";
import { DatasetDetailClient } from "./dataset-detail-client";

interface DatasetPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DatasetPageProps) {
  const { id } = await params;
  const dataset = await getDatasetById(id);

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
  const dataset = await getDatasetById(id);

  if (!dataset) {
    notFound();
  }

  // Prefer rendering README content from DB; if absent, try to load from a readme file.
  let readme = dataset.readme;
  if (!readme && dataset.files && dataset.files.length > 0) {
    const readmeFile = dataset.files.find((f) => {
      const name = (f.name || "").toLowerCase();
      const base = (f.path?.split("/").pop() || "").toLowerCase();
      return (
        name === "readme.md" ||
        name === "readme.markdown" ||
        base === "readme.md" ||
        base === "readme.markdown"
      );
    });

    if (readmeFile) {
      const { content } = await getFileContentWithLimit(
        `datasets/${id}/${readmeFile.path}`,
        256 * 1024
      );
      readme = content;
    }
  }

  return <DatasetDetailClient dataset={{ ...dataset, readme }} />;
}
