import { NextRequest, NextResponse } from "next/server";
import { getFileContentWithLimit, getPublicUrl, getSignedDownloadUrl, getFileType } from "@/lib/oss";
import { sql } from "@/db";

/**
 * GET /api/datasets/[id]/files/preview?path=...
 * 
 * Fetches file content for preview. Supports:
 * - JSON files: Returns parsed JSON content
 * - Markdown files: Returns raw markdown content
 * - MP4 files: Returns signed video URL
 * - Parquet files: Returns preview data from database if available
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "File path is required" }, { status: 400 });
  }

  try {
    const fileType = getFileType(filePath);
    const cosKey = `datasets/${id}/${filePath}`;

    switch (fileType) {
      case "json": {
        const { content, truncated } = await getFileContentWithLimit(cosKey, 512 * 1024); // 512KB limit
        try {
          const parsed = JSON.parse(content);
          return NextResponse.json({
            type: "json",
            content: JSON.stringify(parsed, null, 2),
            truncated,
          });
        } catch {
          // If JSON parsing fails, return as raw text
          return NextResponse.json({
            type: "json",
            content,
            truncated,
            parseError: true,
          });
        }
      }

      case "md": {
        const { content, truncated } = await getFileContentWithLimit(cosKey, 256 * 1024); // 256KB limit
        return NextResponse.json({
          type: "md",
          content,
          truncated,
        });
      }

      case "mp4": {
        // Generate a signed URL for video playback
        const videoUrl = await getSignedDownloadUrl(cosKey, 3600); // 1 hour expiry
        return NextResponse.json({
          type: "mp4",
          videoUrl,
        });
      }

      case "parquet": {
        // Try to get preview data from database
        const rows = await sql`
          SELECT preview_data 
          FROM dataset_files 
          WHERE dataset_id = ${id} AND path = ${filePath}
        `;
        
        if (rows.length > 0 && rows[0].preview_data) {
          return NextResponse.json({
            type: "parquet",
            parquetPreview: rows[0].preview_data,
          });
        }
        
        // Parquet files need pre-processed preview data
        return NextResponse.json({
          type: "parquet",
          error: "Parquet preview not available. Please use the CLI to upload with preview data.",
        });
      }

      default:
        return NextResponse.json({
          type: "other",
          error: "Preview not supported for this file type",
        });
    }
  } catch (error) {
    console.error("Failed to fetch file preview:", error);
    return NextResponse.json(
      { error: "Failed to fetch file preview" },
      { status: 500 }
    );
  }
}
