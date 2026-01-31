"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, FileText, FileJson, FileVideo, Table2 } from "lucide-react";
import { Dataset, ObservationType, DatasetFile } from "@/types/dataset";
import { filterOptions } from "@/data/datasets";

interface DatasetFormProps {
  dataset?: Dataset;
  onSubmit: (data: Partial<Dataset>) => void;
  formId?: string;
  hideSubmitButton?: boolean;
}

export function DatasetForm({ dataset, onSubmit, formId, hideSubmitButton }: DatasetFormProps) {
  const [formData, setFormData] = useState({
    name: dataset?.name || "",
    author: dataset?.author || "",
    description: dataset?.description || "",
    datasetFormat: dataset?.datasetFormat || "lerobot",
    robotType: dataset?.robotType || "",
    taskType: dataset?.taskType || "",
    license: dataset?.license || "MIT",
    size: dataset?.size || "",
    totalEpisodes: dataset?.totalEpisodes?.toString() || "0",
    totalFrames: dataset?.totalFrames?.toString() || "0",
    fps: dataset?.fps?.toString() || "30",
    actionSpaceType: dataset?.actionSpace?.type || "continuous",
    actionSpaceDimensions: dataset?.actionSpace?.dimensions?.toString() || "0",
    actionSpaceDescription: dataset?.actionSpace?.description || "",
    environment: dataset?.environment || "",
    simulationFramework: dataset?.simulationFramework || "",
    downloads: dataset?.downloads?.toString() || "0",
  });
  
  const [tags, setTags] = useState<string[]>(dataset?.tags || []);
  const [newTag, setNewTag] = useState("");
  
  const [observationTypes, setObservationTypes] = useState<ObservationType[]>(
    dataset?.observationTypes || []
  );
  const [newObs, setNewObs] = useState<{ name: string; type: ObservationType["type"]; shape: string; description: string }>({ name: "", type: "state", shape: "", description: "" });
  
  const [files, setFiles] = useState<DatasetFile[]>(dataset?.files || []);
  const [newFile, setNewFile] = useState({ name: "", path: "", type: "parquet" as DatasetFile["type"], size: "", videoUrl: "" });
  const [filesTouched, setFilesTouched] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addObservationType = () => {
    if (newObs.name.trim()) {
      setObservationTypes([...observationTypes, {
        name: newObs.name,
        type: newObs.type,
        shape: newObs.shape || undefined,
        description: newObs.description || undefined,
      }]);
      setNewObs({ name: "", type: "state", shape: "", description: "" });
    }
  };

  const removeObservationType = (index: number) => {
    setObservationTypes(observationTypes.filter((_, i) => i !== index));
  };

  const addFile = () => {
    if (newFile.name.trim() && newFile.path.trim()) {
      setFiles([...files, {
        name: newFile.name,
        path: newFile.path,
        type: newFile.type,
        size: newFile.size || "",
        videoUrl: newFile.type === "mp4" ? newFile.videoUrl : undefined,
      }]);
      setFilesTouched(true);
      setNewFile({ name: "", path: "", type: "parquet", size: "", videoUrl: "" });
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setFilesTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags,
      totalEpisodes: parseInt(formData.totalEpisodes) || 0,
      totalFrames: parseInt(formData.totalFrames) || 0,
      fps: parseInt(formData.fps) || 30,
      downloads: parseInt(formData.downloads) || 0,
      datasetFormat: formData.datasetFormat as "lerobot" | "corobot",
      actionSpace: {
        type: formData.actionSpaceType as "continuous" | "discrete" | "mixed",
        dimensions: parseInt(formData.actionSpaceDimensions) || 0,
        description: formData.actionSpaceDescription || undefined,
      },
      observationTypes,
      ...(filesTouched ? { files } : {}),
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Dataset name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Author *</label>
              <Input
                value={formData.author}
                onChange={(e) => handleChange("author", e.target.value)}
                placeholder="Author or organization"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <textarea
              className="w-full min-h-20 px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the dataset..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Format *</label>
              <Select
                value={formData.datasetFormat}
                onValueChange={(value) => handleChange("datasetFormat", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lerobot">LeRobot</SelectItem>
                  <SelectItem value="corobot">Corobot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">License</label>
              <Select
                value={formData.license}
                onValueChange={(value) => handleChange("license", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.licenses.map((license) => (
                    <SelectItem key={license} value={license}>
                      {license}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Robot & Task */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Robot & Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Robot Type</label>
              <Select
                value={formData.robotType}
                onValueChange={(value) => handleChange("robotType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select robot" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.robotTypes.map((robot) => (
                    <SelectItem key={robot} value={robot}>
                      {robot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Type</label>
              <Select
                value={formData.taskType}
                onValueChange={(value) => handleChange("taskType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.taskTypes.map((task) => (
                    <SelectItem key={task} value={task}>
                      {task}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Environment</label>
              <Input
                value={formData.environment}
                onChange={(e) => handleChange("environment", e.target.value)}
                placeholder="e.g., Kitchen, Outdoor"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Simulation Framework</label>
              <Input
                value={formData.simulationFramework}
                onChange={(e) => handleChange("simulationFramework", e.target.value)}
                placeholder="e.g., MuJoCo, PyBullet"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Episode Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Episode Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Episodes</label>
              <Input
                type="number"
                value={formData.totalEpisodes}
                onChange={(e) => handleChange("totalEpisodes", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Frames</label>
              <Input
                type="number"
                value={formData.totalFrames}
                onChange={(e) => handleChange("totalFrames", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">FPS</label>
              <Input
                type="number"
                value={formData.fps}
                onChange={(e) => handleChange("fps", e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Size</label>
              <Input
                value={formData.size}
                onChange={(e) => handleChange("size", e.target.value)}
                placeholder="e.g., 10.5 GB"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observation Types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Observation Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {observationTypes.length > 0 && (
            <div className="space-y-2">
              {observationTypes.map((obs, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    <code className="text-sm">{obs.name}</code>
                    <Badge variant="secondary" className="text-xs">{obs.type}</Badge>
                    {obs.shape && <Badge variant="outline" className="text-xs font-mono">{obs.shape}</Badge>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeObservationType(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-4 gap-2">
            <Input
              value={newObs.name}
              onChange={(e) => setNewObs({ ...newObs, name: e.target.value })}
              placeholder="observation.state"
              className="col-span-1"
            />
            <Select
              value={newObs.type}
              onValueChange={(value) => setNewObs({ ...newObs, type: value as ObservationType["type"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.observationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={newObs.shape}
              onChange={(e) => setNewObs({ ...newObs, shape: e.target.value })}
              placeholder="Shape (e.g., 480x640x3)"
            />
            <Button type="button" variant="outline" onClick={addObservationType}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Space */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Action Space</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.actionSpaceType}
                onValueChange={(value) => handleChange("actionSpaceType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continuous">Continuous</SelectItem>
                  <SelectItem value="discrete">Discrete</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dimensions</label>
              <Input
                type="number"
                value={formData.actionSpaceDimensions}
                onChange={(e) => handleChange("actionSpaceDimensions", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.actionSpaceDescription}
              onChange={(e) => handleChange("actionSpaceDescription", e.target.value)}
              placeholder="e.g., Joint position targets"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Files (Parquet, JSON, MP4)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    {file.type === "parquet" && <Table2 className="h-4 w-4" />}
                    {file.type === "json" && <FileJson className="h-4 w-4" />}
                    {file.type === "mp4" && <FileVideo className="h-4 w-4" />}
                    {file.type === "other" && <FileText className="h-4 w-4" />}
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{file.type}</Badge>
                    {file.size && <span className="text-xs text-muted-foreground">{file.size}</span>}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2">
              <Input
                value={newFile.name}
                onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
                placeholder="File name"
              />
              <Input
                value={newFile.path}
                onChange={(e) => setNewFile({ ...newFile, path: e.target.value })}
                placeholder="File path"
              />
              <Select
                value={newFile.type}
                onValueChange={(value) => setNewFile({ ...newFile, type: value as DatasetFile["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parquet">Parquet</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={newFile.size}
                onChange={(e) => setNewFile({ ...newFile, size: e.target.value })}
                placeholder="Size (e.g., 1.5 GB)"
              />
            </div>
            {newFile.type === "mp4" && (
              <Input
                value={newFile.videoUrl}
                onChange={(e) => setNewFile({ ...newFile, videoUrl: e.target.value })}
                placeholder="Video URL for preview"
              />
            )}
            <Button type="button" variant="outline" onClick={addFile} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add File
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats (for editing) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Downloads</label>
              <Input
                type="number"
                value={formData.downloads}
                onChange={(e) => handleChange("downloads", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!hideSubmitButton && (
        <div className="flex justify-end gap-2">
          <Button type="submit">
            {dataset ? "Update Dataset" : "Create Dataset"}
          </Button>
        </div>
      )}
    </form>
  );
}
