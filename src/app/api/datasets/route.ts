import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllDatasets, createDataset } from "@/db/datasets";

export async function GET() {
  try {
    const datasets = await getAllDatasets();
    return NextResponse.json(datasets);
  } catch (error) {
    console.error("Failed to fetch datasets:", error);
    return NextResponse.json(
      { error: "Failed to fetch datasets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.author || !data.description) {
      return NextResponse.json(
        { error: "Name, author, and description are required" },
        { status: 400 }
      );
    }

    const dataset = await createDataset({
      name: data.name,
      author: data.author,
      description: data.description,
      tags: data.tags || [],
      downloads: data.downloads || 0,
      likes: data.likes || 0,
      updatedAt: new Date().toISOString().split("T")[0],
      size: data.size || "0 GB",
      format: data.format || "parquet",
      license: data.license || "MIT",
      task: data.task || "Other",
      language: data.language,
      rows: data.rows || 0,
      splits: data.splits || [],
      features: data.features || [],
      previewData: data.previewData || [],
    });

    return NextResponse.json(dataset, { status: 201 });
  } catch (error) {
    console.error("Failed to create dataset:", error);
    return NextResponse.json(
      { error: "Failed to create dataset" },
      { status: 500 }
    );
  }
}
