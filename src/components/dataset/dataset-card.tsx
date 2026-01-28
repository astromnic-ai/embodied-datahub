import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Heart, Calendar, Database } from "lucide-react";
import { Dataset } from "@/types/dataset";
import { formatNumber } from "@/data/datasets";

interface DatasetCardProps {
  dataset: Dataset;
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  return (
    <Link href={`/datasets/${dataset.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-border/50 hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {dataset.author.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {dataset.author}
                </p>
                <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                  {dataset.name}
                </h3>
              </div>
            </div>
            <Badge variant="secondary" className="flex-shrink-0 text-xs">
              {dataset.task}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {dataset.description}
          </p>

          {/* Tags */}
          <div className="flex gap-1 mb-3">
            {dataset.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0 h-5"
              >
                {tag}
              </Badge>
            ))}
            {dataset.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0 h-5 flex-shrink-0">
                +{dataset.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {formatNumber(dataset.downloads)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatNumber(dataset.likes)}
              </span>
              {dataset.rows && (
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  {formatNumber(dataset.rows)}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {dataset.updatedAt}
            </span>
          </div>

          {/* Format & Size */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t">
            <Badge variant="secondary" className="text-xs">
              {dataset.format}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {dataset.size}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
