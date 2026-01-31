import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Tencent Cloud COS Configuration (S3-compatible)
const COS_REGION = process.env.COS_REGION || "ap-shanghai";
const COS_BUCKET = process.env.COS_BUCKET || "";

const s3Client = new S3Client({
  region: COS_REGION,
  endpoint: `https://cos.${COS_REGION}.myqcloud.com`,
  credentials: {
    accessKeyId: process.env.COS_SECRET_ID || "",
    secretAccessKey: process.env.COS_SECRET_KEY || "",
  },
  forcePathStyle: false, // COS uses virtual-hosted style
});

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

/**
 * Upload a file to COS
 */
export async function uploadToOSS(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string
): Promise<UploadResult> {
  const command = new PutObjectCommand({
    Bucket: COS_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);

  const url = getPublicUrl(key);
  const size = typeof body === "string" ? Buffer.byteLength(body) : body.length;

  return { key, url, size };
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(key: string): string {
  return `https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/${key}`;
}

/**
 * Generate a pre-signed URL for downloading
 */
export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: COS_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * List files in a directory
 */
export async function listFiles(prefix: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: COS_BUCKET,
    Prefix: prefix,
  });

  const response = await s3Client.send(command);
  return response.Contents?.map((obj) => obj.Key || "") || [];
}

/**
 * Get file content
 */
export async function getFileContent(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: COS_BUCKET,
    Key: key,
  });

  const response = await s3Client.send(command);
  const body = await response.Body?.transformToString();
  return body || "";
}

/**
 * Delete files from COS
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  
  // Delete in batches of 1000
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    const command = new DeleteObjectsCommand({
      Bucket: COS_BUCKET,
      Delete: {
        Objects: batch.map(key => ({ Key: key })),
        Quiet: true,
      },
    });
    await s3Client.send(command);
  }
}

/**
 * Delete all files for a dataset
 */
export async function deleteDatasetFiles(datasetId: string): Promise<void> {
  const prefix = `datasets/${datasetId}/`;
  const files = await listFiles(prefix);
  await deleteFiles(files);
}

/**
 * Calculate human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get file type from extension
 */
export function getFileType(filename: string): "parquet" | "json" | "mp4" | "md" | "other" {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "parquet":
      return "parquet";
    case "json":
      return "json";
    case "mp4":
      return "mp4";
    case "md":
    case "markdown":
      return "md";
    default:
      return "other";
  }
}

/**
 * Check if file type supports preview
 */
export function isPreviewable(filename: string): boolean {
  const type = getFileType(filename);
  return type === "json" || type === "md" || type === "mp4" || type === "parquet";
}

/**
 * Get file content with size limit
 */
export async function getFileContentWithLimit(key: string, maxBytes: number = 1024 * 1024): Promise<{ content: string; truncated: boolean }> {
  const command = new GetObjectCommand({
    Bucket: COS_BUCKET,
    Key: key,
    Range: `bytes=0-${maxBytes - 1}`,
  });

  const response = await s3Client.send(command);
  const contentLength = response.ContentLength || 0;
  const body = await response.Body?.transformToString();
  
  return {
    content: body || "",
    truncated: contentLength >= maxBytes,
  };
}
