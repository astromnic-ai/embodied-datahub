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
import { X, Plus } from "lucide-react";
import { Dataset } from "@/types/dataset";
import { filterOptions } from "@/data/datasets";

interface DatasetFormProps {
  dataset?: Dataset;
  onSubmit: (data: Partial<Dataset>) => void;
}

export function DatasetForm({ dataset, onSubmit }: DatasetFormProps) {
  const [formData, setFormData] = useState({
    name: dataset?.name || "",
    author: dataset?.author || "",
    description: dataset?.description || "",
    task: dataset?.task || "",
    format: dataset?.format || "parquet",
    license: dataset?.license || "MIT",
    size: dataset?.size || "",
    rows: dataset?.rows?.toString() || "",
    downloads: dataset?.downloads?.toString() || "0",
    likes: dataset?.likes?.toString() || "0",
    language: dataset?.language || "",
  });
  const [tags, setTags] = useState<string[]>(dataset?.tags || []);
  const [newTag, setNewTag] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags,
      rows: parseInt(formData.rows) || 0,
      downloads: parseInt(formData.downloads) || 0,
      likes: parseInt(formData.likes) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full min-h-24 px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the dataset..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Task</label>
          <Select
            value={formData.task}
            onValueChange={(value) => handleChange("task", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select task" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.tasks.map((task) => (
                <SelectItem key={task} value={task}>
                  {task}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <Select
            value={formData.format}
            onValueChange={(value) => handleChange("format", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.formats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">License</label>
          <Select
            value={formData.license}
            onValueChange={(value) => handleChange("license", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select license" />
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Size</label>
          <Input
            value={formData.size}
            onChange={(e) => handleChange("size", e.target.value)}
            placeholder="e.g., 10.5 GB"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Rows</label>
          <Input
            type="number"
            value={formData.rows}
            onChange={(e) => handleChange("rows", e.target.value)}
            placeholder="Number of rows"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Downloads</label>
          <Input
            type="number"
            value={formData.downloads}
            onChange={(e) => handleChange("downloads", e.target.value)}
            placeholder="Download count"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Likes</label>
          <Input
            type="number"
            value={formData.likes}
            onChange={(e) => handleChange("likes", e.target.value)}
            placeholder="Like count"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Language (optional)</label>
        <Input
          value={formData.language}
          onChange={(e) => handleChange("language", e.target.value)}
          placeholder="e.g., English, Multilingual"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tags</label>
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
          <div className="flex flex-wrap gap-1 mt-2">
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
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">
          {dataset ? "Update Dataset" : "Create Dataset"}
        </Button>
      </div>
    </form>
  );
}
