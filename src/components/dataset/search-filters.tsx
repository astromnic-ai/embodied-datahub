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
  selectedFormat: string;
  selectedRobotType: string;
  selectedTaskType: string;
  selectedLicense: string;
  onFormatChange: (value: string) => void;
  onRobotTypeChange: (value: string) => void;
  onTaskTypeChange: (value: string) => void;
  onLicenseChange: (value: string) => void;
  onClearFilters: () => void;
}

export function SearchFilters({
  selectedFormat,
  selectedRobotType,
  selectedTaskType,
  selectedLicense,
  onFormatChange,
  onRobotTypeChange,
  onTaskTypeChange,
  onLicenseChange,
  onClearFilters,
}: SearchFiltersProps) {
  const hasFilters = selectedFormat || selectedRobotType || selectedTaskType || selectedLicense;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </div>

        <Select value={selectedFormat} onValueChange={onFormatChange}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            {filterOptions.datasetFormats.map((format) => (
              <SelectItem key={format} value={format}>
                {format === "lerobot" ? "LeRobot" : "Corobot"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedRobotType} onValueChange={onRobotTypeChange}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Robot Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Robots</SelectItem>
            {filterOptions.robotTypes.map((robot) => (
              <SelectItem key={robot} value={robot}>
                {robot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTaskType} onValueChange={onTaskTypeChange}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Task Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            {filterOptions.taskTypes.map((task) => (
              <SelectItem key={task} value={task}>
                {task}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLicense} onValueChange={onLicenseChange}>
          <SelectTrigger className="w-[140px] h-9">
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
          {selectedFormat && selectedFormat !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {selectedFormat === "lerobot" ? "LeRobot" : "Corobot"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFormatChange("all")}
              />
            </Badge>
          )}
          {selectedRobotType && selectedRobotType !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {selectedRobotType}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRobotTypeChange("all")}
              />
            </Badge>
          )}
          {selectedTaskType && selectedTaskType !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {selectedTaskType}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onTaskTypeChange("all")}
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
