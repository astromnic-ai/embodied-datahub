import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getDatasetById, updateDataset } from "@/db/datasets";
import { formatFileSize, getFileType } from "@/lib/oss";
import { DatasetFile } from "@/types/dataset";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if dataset exists
    const dataset = await getDatasetById(id);
    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    const { files, totalSize } = await request.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: "Files array is required" },
        { status: 400 }
      );
    }

    // Process uploaded files info from CLI
    const datasetFiles: DatasetFile[] = files.map((file: {
      name: string;
      path: string;
      size: number;
      url: string;
      previewData?: {
        columns: string[];
        rows: Record<string, unknown>[];
        totalRows: number;
      };
    }) => ({
      name: file.name,
      path: file.path,
      type: getFileType(file.name),
      size: formatFileSize(file.size),
      ossUrl: file.url,
      videoUrl: file.name.endsWith(".mp4") ? file.url : undefined,
      previewData: file.previewData || undefined,
    }));

    // Update dataset with files and size
    const updated = await updateDataset(id, {
      files: datasetFiles,
      size: formatFileSize(totalSize),
      updatedAt: new Date().toISOString().split("T")[0],
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to complete upload:", error);
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    );
  }
}
