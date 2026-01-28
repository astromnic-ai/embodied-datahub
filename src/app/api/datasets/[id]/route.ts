import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getDatasetById, updateDataset, deleteDataset } from "@/lib/dataset-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dataset = getDatasetById(id);
  
  if (!dataset) {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  }
  
  return NextResponse.json(dataset);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  try {
    const data = await request.json();
    const updated = updateDataset(id, {
      ...data,
      updatedAt: new Date().toISOString().split("T")[0],
    });
    
    if (!updated) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteDataset(id);
  
  if (!deleted) {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
