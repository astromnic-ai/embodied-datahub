"use client";

import { useState, useCallback, useRef, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  FileJson,
  FileVideo,
  File,
  Eye,
  Download,
  Table2,
  Loader2,
  FileCode,
  AlertCircle,
} from "lucide-react";
import { FileTreeItem, FileTreeResponse, DatasetFile, ParquetPreview, JsonPreview, FilePreviewResponse, FileType } from "@/types/dataset";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FileTreeProps {
  datasetId: string;
  initialFiles?: DatasetFile[];
}

interface TreeNodeState {
  isExpanded: boolean;
  isLoading: boolean;
  children: FileTreeItem[];
  hasMore: boolean;
  nextCursor?: string;
  loaded: boolean;
}

// File icon helper
function getFileIcon(type?: string, isDirectory?: boolean) {
  if (isDirectory) return null; // Folder icon is handled separately
  switch (type) {
    case "parquet":
      return <Table2 className="h-4 w-4 text-blue-500" />;
    case "json":
      return <FileJson className="h-4 w-4 text-yellow-500" />;
    case "mp4":
      return <FileVideo className="h-4 w-4 text-red-500" />;
    case "md":
      return <FileCode className="h-4 w-4 text-purple-500" />;
    default:
      return <File className="h-4 w-4 text-gray-500" />;
  }
}

function getFileBadgeVariant(type?: string) {
  switch (type) {
    case "parquet":
      return "default";
    case "json":
      return "secondary";
    case "mp4":
      return "destructive";
    case "md":
      return "outline";
    default:
      return "outline";
  }
}

// Check if file type supports preview
function isPreviewableType(type?: FileType): boolean {
  return type === "json" || type === "md" || type === "mp4" || type === "parquet";
}

// Preview components
function ParquetPreviewContent({ preview }: { preview: ParquetPreview }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{preview.columns.length} columns</span>
        <span>{preview.totalRows.toLocaleString()} total rows</span>
      </div>
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              {preview.columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-medium whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, i) => (
              <tr key={i} className="border-t">
                {preview.columns.map((col) => (
                  <td
                    key={col}
                    className="px-4 py-2 font-mono text-xs whitespace-nowrap max-w-48 truncate"
                  >
                    {formatCellValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing first {preview.rows.length} rows
      </p>
    </div>
  );
}

function JsonPreviewContent({ content, truncated }: { content: string; truncated?: boolean }) {
  return (
    <div className="space-y-4">
      {truncated && (
        <p className="text-xs text-muted-foreground">
          Content truncated for preview
        </p>
      )}
      <div className="overflow-x-auto">
        <pre className="bg-muted p-4 rounded-lg text-xs">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}

function MarkdownPreviewContent({ content, truncated }: { content: string; truncated?: boolean }) {
  return (
    <div className="space-y-4">
      {truncated && (
        <p className="text-xs text-muted-foreground">
          Content truncated for preview
        </p>
      )}
      <div className="markdown-content text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
            h4: ({ children }) => <h4 className="text-base font-semibold mt-3 mb-2">{children}</h4>,
            p: ({ children }) => <p className="my-3 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="my-3 ml-6 list-disc space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="my-3 ml-6 list-decimal space-y-1">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            a: ({ href, children }) => (
              <a href={href} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="my-4 p-4 rounded-lg bg-muted overflow-x-auto text-sm">
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-4 pl-4 border-l-4 border-muted-foreground/30 text-muted-foreground italic">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="my-4 overflow-x-auto">
                <table className="w-full border-collapse border border-border text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
            th: ({ children }) => <th className="px-3 py-2 text-left font-semibold border border-border">{children}</th>,
            td: ({ children }) => <td className="px-3 py-2 border border-border">{children}</td>,
            hr: () => <hr className="my-6 border-border" />,
            img: ({ src, alt }) => (
              <img src={src} alt={alt || ''} className="my-4 max-w-full rounded-lg" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function VideoPreviewContent({ videoUrl }: { videoUrl: string }) {
  return (
    <div className="space-y-4">
      <video
        className="w-full max-h-96 rounded-lg bg-black"
        controls
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

function PreviewError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground">
      <AlertCircle className="h-5 w-5" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return `[${value.length} items]`;
    }
    return JSON.stringify(value).slice(0, 50) + "...";
  }
  return String(value);
}

// File Preview Dialog Component with lazy loading
interface FilePreviewDialogProps {
  item: FileTreeItem;
  datasetId: string;
  isOpen: boolean;
  onClose: () => void;
}

function FilePreviewDialog({ item, datasetId, isOpen, onClose }: FilePreviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<FilePreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if dialog is open, no preview data, not loading, and no error
    if (isOpen && !preview && !loading && !error) {
      const fetchPreview = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `/api/datasets/${datasetId}/files/preview?path=${encodeURIComponent(item.path)}`
          );
          if (!response.ok) {
            throw new Error("Failed to load preview");
          }
          const data = await response.json();
          if (data.error) {
            setError(data.error);
          } else {
            setPreview(data);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load preview");
        } finally {
          setLoading(false);
        }
      };
      fetchPreview();
    }
  }, [isOpen, item.path, datasetId, preview, loading, error]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setPreview(null);
      setError(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="border-b px-6 py-4 pr-14 shrink-0">
          <DialogTitle className="flex items-center gap-2 pr-4">
            {getFileIcon(item.type)}
            <span className="truncate">{item.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading preview...</span>
            </div>
          )}
          
          {error && <PreviewError message={error} />}
          
          {preview && !error && (
            <>
              {preview.type === "json" && preview.content && (
                <JsonPreviewContent content={preview.content} truncated={preview.truncated} />
              )}
              {preview.type === "md" && preview.content && (
                <MarkdownPreviewContent content={preview.content} truncated={preview.truncated} />
              )}
              {preview.type === "mp4" && preview.videoUrl && (
                <VideoPreviewContent videoUrl={preview.videoUrl} />
              )}
              {preview.type === "parquet" && preview.parquetPreview && (
                <ParquetPreviewContent preview={preview.parquetPreview} />
              )}
              {preview.type === "parquet" && !preview.parquetPreview && preview.error && (
                <PreviewError message={preview.error} />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Tree Node Component
interface TreeNodeProps {
  item: FileTreeItem;
  depth: number;
  datasetId: string;
  nodeStates: Map<string, TreeNodeState>;
  onToggle: (path: string) => void;
  onLoadMore: (path: string) => void;
  fileDataMap: Map<string, DatasetFile>;
}

const TreeNode = memo(function TreeNode({
  item,
  depth,
  datasetId,
  nodeStates,
  onToggle,
  onLoadMore,
  fileDataMap,
}: TreeNodeProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const state = nodeStates.get(item.path);
  const isExpanded = state?.isExpanded ?? false;
  const isLoading = state?.isLoading ?? false;
  const children = state?.children ?? [];
  const hasMore = state?.hasMore ?? false;
  
  const file = fileDataMap.get(item.path);
  const canPreview = isPreviewableType(item.type);

  return (
    <div className="select-none">
      {/* Node row */}
      <div
        className={cn(
          "flex items-center gap-1 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors",
          "group"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => item.isDirectory && onToggle(item.path)}
      >
        {/* Expand/Collapse icon for directories */}
        {item.isDirectory ? (
          <span className="w-4 h-4 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            ) : isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </span>
        ) : (
          <span className="w-4 h-4" />
        )}

        {/* Icon */}
        {item.isDirectory ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-400" />
          ) : (
            <Folder className="h-4 w-4 text-blue-400" />
          )
        ) : (
          getFileIcon(item.type)
        )}

        {/* Name */}
        <span className="flex-1 truncate text-sm">{item.name}</span>

        {/* Metadata */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.isDirectory && item.childCount !== undefined && (
            <span className="text-xs text-muted-foreground">
              {item.childCount} items
            </span>
          )}
          {!item.isDirectory && item.size && (
            <span className="text-xs text-muted-foreground">{item.size}</span>
          )}
          {!item.isDirectory && item.type && (
            <Badge
              variant={getFileBadgeVariant(item.type) as "default" | "secondary" | "destructive" | "outline"}
              className="text-xs h-5"
            >
              {item.type}
            </Badge>
          )}
          
          {/* Preview button for previewable files */}
          {!item.isDirectory && canPreview && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewOpen(true);
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}

          {/* Download button */}
          {!item.isDirectory && file?.ossUrl && (
            <a
              href={file.ossUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Download className="h-3 w-3" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      {!item.isDirectory && canPreview && (
        <FilePreviewDialog
          item={item}
          datasetId={datasetId}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {/* Children */}
      {item.isDirectory && isExpanded && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.path}
              item={child}
              depth={depth + 1}
              datasetId={datasetId}
              nodeStates={nodeStates}
              onToggle={onToggle}
              onLoadMore={onLoadMore}
              fileDataMap={fileDataMap}
            />
          ))}
          
          {/* Load more button */}
          {hasMore && (
            <div
              className="flex items-center gap-2 py-1.5 px-2"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoadMore(item.path)}
                disabled={isLoading}
                className="text-xs text-muted-foreground"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : null}
                Load more...
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export function FileTree({ datasetId, initialFiles = [] }: FileTreeProps) {
  // State for tree node expansion and children
  const [nodeStates, setNodeStates] = useState<Map<string, TreeNodeState>>(new Map());
  const [rootItems, setRootItems] = useState<FileTreeItem[]>([]);
  const [rootHasMore, setRootHasMore] = useState(false);
  const [rootNextCursor, setRootNextCursor] = useState<string | undefined>();
  const [isRootLoading, setIsRootLoading] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  
  // Build a map of file path to file data for quick lookup (for preview data)
  const fileDataMap = useRef(new Map<string, DatasetFile>());
  
  useEffect(() => {
    const map = new Map<string, DatasetFile>();
    for (const file of initialFiles) {
      map.set(file.path, file);
    }
    fileDataMap.current = map;
  }, [initialFiles]);

  // Fetch files for a given path
  const fetchFiles = useCallback(async (
    path: string,
    cursor?: string
  ): Promise<FileTreeResponse> => {
    const params = new URLSearchParams();
    if (path) params.set("path", path);
    if (cursor) params.set("cursor", cursor);
    params.set("limit", "50");
    
    const response = await fetch(`/api/datasets/${datasetId}/files?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch files");
    }
    return response.json();
  }, [datasetId]);

  // Load root items on mount
  useEffect(() => {
    const loadRoot = async () => {
      setIsRootLoading(true);
      try {
        const result = await fetchFiles("");
        setRootItems(result.items);
        setRootHasMore(result.hasMore);
        setRootNextCursor(result.nextCursor);
        setTotalFiles(result.totalCount);
      } catch (error) {
        console.error("Failed to load root files:", error);
      } finally {
        setIsRootLoading(false);
      }
    };
    
    loadRoot();
  }, [fetchFiles]);

  // Toggle folder expansion
  const handleToggle = useCallback(async (path: string) => {
    const currentState = nodeStates.get(path);
    
    if (currentState?.isExpanded) {
      // Collapse
      setNodeStates((prev) => {
        const next = new Map(prev);
        next.set(path, { ...currentState, isExpanded: false });
        return next;
      });
    } else if (currentState?.loaded) {
      // Already loaded, just expand
      setNodeStates((prev) => {
        const next = new Map(prev);
        next.set(path, { ...currentState, isExpanded: true });
        return next;
      });
    } else {
      // Need to load
      setNodeStates((prev) => {
        const next = new Map(prev);
        next.set(path, {
          isExpanded: true,
          isLoading: true,
          children: [],
          hasMore: false,
          loaded: false,
        });
        return next;
      });

      try {
        const result = await fetchFiles(path);
        setNodeStates((prev) => {
          const next = new Map(prev);
          next.set(path, {
            isExpanded: true,
            isLoading: false,
            children: result.items,
            hasMore: result.hasMore,
            nextCursor: result.nextCursor,
            loaded: true,
          });
          return next;
        });
      } catch (error) {
        console.error("Failed to load folder:", error);
        setNodeStates((prev) => {
          const next = new Map(prev);
          next.set(path, {
            isExpanded: false,
            isLoading: false,
            children: [],
            hasMore: false,
            loaded: false,
          });
          return next;
        });
      }
    }
  }, [nodeStates, fetchFiles]);

  // Load more items for a folder
  const handleLoadMore = useCallback(async (path: string) => {
    const currentState = nodeStates.get(path);
    if (!currentState || !currentState.nextCursor || currentState.isLoading) return;

    setNodeStates((prev) => {
      const next = new Map(prev);
      next.set(path, { ...currentState, isLoading: true });
      return next;
    });

    try {
      const result = await fetchFiles(path, currentState.nextCursor);
      setNodeStates((prev) => {
        const next = new Map(prev);
        const prevState = prev.get(path)!;
        next.set(path, {
          ...prevState,
          isLoading: false,
          children: [...prevState.children, ...result.items],
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
        });
        return next;
      });
    } catch (error) {
      console.error("Failed to load more:", error);
      setNodeStates((prev) => {
        const next = new Map(prev);
        const prevState = prev.get(path)!;
        next.set(path, { ...prevState, isLoading: false });
        return next;
      });
    }
  }, [nodeStates, fetchFiles]);

  // Load more root items
  const handleLoadMoreRoot = useCallback(async () => {
    if (!rootNextCursor || isRootLoading) return;

    setIsRootLoading(true);
    try {
      const result = await fetchFiles("", rootNextCursor);
      setRootItems((prev) => [...prev, ...result.items]);
      setRootHasMore(result.hasMore);
      setRootNextCursor(result.nextCursor);
    } catch (error) {
      console.error("Failed to load more root files:", error);
    } finally {
      setIsRootLoading(false);
    }
  }, [rootNextCursor, isRootLoading, fetchFiles]);

  if (isRootLoading && rootItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading files...</span>
      </div>
    );
  }

  if (rootItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No files available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-2 pb-2 border-b">
        <span className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          {totalFiles} items
        </span>
      </div>

      {/* Tree */}
      <ScrollArea className="h-[500px]">
        <div className="pr-4">
          {rootItems.map((item) => (
            <TreeNode
              key={item.path}
              item={item}
              depth={0}
              datasetId={datasetId}
              nodeStates={nodeStates}
              onToggle={handleToggle}
              onLoadMore={handleLoadMore}
              fileDataMap={fileDataMap.current}
            />
          ))}
          
          {/* Load more root items */}
          {rootHasMore && (
            <div className="py-2 px-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMoreRoot}
                disabled={isRootLoading}
                className="text-xs text-muted-foreground w-full"
              >
                {isRootLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : null}
                Load more ({totalFiles - rootItems.length} remaining)
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
