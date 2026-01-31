"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DatasetCard } from "@/components/dataset/dataset-card";
import { SearchFilters } from "@/components/dataset/search-filters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Database,
  TrendingUp,
  Clock,
  LayoutGrid,
  List,
  Loader2,
  Film,
} from "lucide-react";
import { Dataset } from "@/types/dataset";
import { formatNumber } from "@/data/datasets";

export function HomeContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedRobotType, setSelectedRobotType] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("");
  const [selectedLicense, setSelectedLicense] = useState("");
  const [sortBy, setSortBy] = useState<"trending" | "recent" | "downloads">(
    "trending"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await fetch("/api/datasets");
        const data = await res.json();
        setDatasets(data);
      } catch (error) {
        console.error("Failed to fetch datasets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const filteredDatasets = useMemo(() => {
    let results = datasets;

    // Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(lowerQuery) ||
          d.description.toLowerCase().includes(lowerQuery) ||
          d.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
          d.author.toLowerCase().includes(lowerQuery) ||
          d.robotType?.toLowerCase().includes(lowerQuery) ||
          d.taskType?.toLowerCase().includes(lowerQuery)
      );
    }

    // Filters
    if (selectedFormat && selectedFormat !== "all") {
      results = results.filter((d) => d.datasetFormat === selectedFormat);
    }
    if (selectedRobotType && selectedRobotType !== "all") {
      results = results.filter((d) => d.robotType === selectedRobotType);
    }
    if (selectedTaskType && selectedTaskType !== "all") {
      results = results.filter((d) => d.taskType === selectedTaskType);
    }
    if (selectedLicense && selectedLicense !== "all") {
      results = results.filter((d) => d.license === selectedLicense);
    }

    // Sort
    if (sortBy === "downloads") {
      results = [...results].sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === "recent") {
      results = [...results].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } else {
      // trending: by downloads
      results = [...results].sort((a, b) => b.downloads - a.downloads);
    }

    return results;
  }, [datasets, searchQuery, selectedFormat, selectedRobotType, selectedTaskType, selectedLicense, sortBy]);

  const clearFilters = () => {
    setSelectedFormat("");
    setSelectedRobotType("");
    setSelectedTaskType("");
    setSelectedLicense("");
  };

  const totalDownloads = datasets.reduce((sum, d) => sum + d.downloads, 0);
  const totalEpisodes = datasets.reduce((sum, d) => sum + (d.totalEpisodes || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-12 px-4 border-b bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Embodied AI Datasets
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover and share LeRobot & Corobot format datasets for robotics
              imitation learning and manipulation research.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, robot type, task, or keyword..."
                className="pl-12 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>
                <strong className="text-foreground">{datasets.length}</strong>{" "}
                Datasets
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              <span>
                <strong className="text-foreground">
                  {formatNumber(totalEpisodes)}
                </strong>{" "}
                Episodes
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>
                <strong className="text-foreground">
                  {formatNumber(totalDownloads)}
                </strong>{" "}
                Downloads
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          {/* Filters & Sort */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <SearchFilters
              selectedFormat={selectedFormat}
              selectedRobotType={selectedRobotType}
              selectedTaskType={selectedTaskType}
              selectedLicense={selectedLicense}
              onFormatChange={setSelectedFormat}
              onRobotTypeChange={setSelectedRobotType}
              onTaskTypeChange={setSelectedTaskType}
              onLicenseChange={setSelectedLicense}
              onClearFilters={clearFilters}
            />

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={sortBy === "trending" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("trending")}
                  className="h-7 px-3"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Button>
                <Button
                  variant={sortBy === "recent" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("recent")}
                  className="h-7 px-3"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Recent
                </Button>
                <Button
                  variant={sortBy === "downloads" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("downloads")}
                  className="h-7 px-3"
                >
                  Downloads
                </Button>
              </div>

              {/* View Mode */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-7 w-7"
                >
                  <LayoutGrid className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-7 w-7"
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="font-normal">
              {filteredDatasets.length} dataset
              {filteredDatasets.length !== 1 ? "s" : ""}
            </Badge>
            {searchQuery && (
              <span className="text-sm text-muted-foreground">
                for &quot;{searchQuery}&quot;
              </span>
            )}
          </div>

          {/* Dataset Grid/List */}
          {filteredDatasets.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "flex flex-col gap-3"
              }
            >
              {filteredDatasets.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No datasets found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
