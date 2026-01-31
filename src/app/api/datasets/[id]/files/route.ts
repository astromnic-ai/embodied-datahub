import { NextRequest, NextResponse } from "next/server";
import { getFileTree } from "@/db/datasets";

/**
 * GET /api/datasets/[id]/files
 * 
 * Query parameters:
 * - path: The folder path to list (default: "", root)
 * - cursor: Pagination cursor for loading more items
 * - limit: Number of items per page (default: 50)
 * 
 * Returns a list of files/folders at the specified path with pagination support.
 * For large datasets, this enables lazy loading of folder contents.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  
  const path = searchParams.get("path") || "";
  const cursor = searchParams.get("cursor") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    const result = await getFileTree(id, path, limit, cursor);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch file tree:", error);
    return NextResponse.json(
      { error: "Failed to fetch file tree" },
      { status: 500 }
    );
  }
}
