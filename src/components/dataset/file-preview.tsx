"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { DatasetFile } from "@/types/dataset";
import { FileTree } from "./file-tree";

interface FilePreviewProps {
  files: DatasetFile[];
  datasetId: string;
}

export function FilePreview({ files, datasetId }: FilePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FileTree datasetId={datasetId} initialFiles={files} />
      </CardContent>
    </Card>
  );
}
