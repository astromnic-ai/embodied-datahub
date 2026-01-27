"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import { filterOptions } from "@/data/datasets";

interface SearchFiltersProps {
  selectedTask: string;
  selectedFormat: string;
  selectedLicense: string;
  onTaskChange: (value: string) => void;
  onFormatChange: (value: string) => void;
  onLicenseChange: (value: string) => void;
  onClearFilters: () => void;
}

export function SearchFilters({
  selectedTask,
  selectedFormat,
  selectedLicense,
  onTaskChange,
  onFormatChange,
  onLicenseChange,
  onClearFilters,
}: SearchFiltersProps) {
  const hasFilters = selectedTask || selectedFormat || selectedLicense;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </div>

        <Select value={selectedTask} onValueChange={onTaskChange}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Task" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            {filterOptions.tasks.map((task) => (
              <SelectItem key={task} value={task}>
                {task}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedFormat} onValueChange={onFormatChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            {filterOptions.formats.map((format) => (
              <SelectItem key={format} value={format}>
                {format}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLicense} onValueChange={onLicenseChange}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="License" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Licenses</SelectItem>
            {filterOptions.licenses.map((license) => (
              <SelectItem key={license} value={license}>
                {license}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active:</span>
          {selectedTask && selectedTask !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {selectedTask}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onTaskChange("all")}
              />
            </Badge>
          )}
          {selectedFormat && selectedFormat !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {selectedFormat}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFormatChange("all")}
              />
            </Badge>
          )}
          {selectedLicense && selectedLicense !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {selectedLicense}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onLicenseChange("all")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
