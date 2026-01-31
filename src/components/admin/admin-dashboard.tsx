"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Boxes,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Database,
  Home,
  Loader2,
  Terminal,
} from "lucide-react";
import { Dataset } from "@/types/dataset";
import { formatNumber } from "@/data/datasets";
import { DatasetForm } from "./dataset-form";

export function AdminDashboard() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

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

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleCreate = async (data: Partial<Dataset>) => {
    try {
      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        fetchDatasets();
      }
    } catch (error) {
      console.error("Failed to create dataset:", error);
    }
  };

  const handleUpdate = async (data: Partial<Dataset>) => {
    if (!editingDataset) return;

    try {
      const res = await fetch(`/api/datasets/${editingDataset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsEditOpen(false);
        setEditingDataset(null);
        fetchDatasets();
      }
    } catch (error) {
      console.error("Failed to update dataset:", error);
    }
  };

  // IMPORTANT: datasets list endpoint (/api/datasets) does not include files.
  // When opening the edit dialog, fetch the full dataset (including files) so
  // we don't accidentally submit an empty files array.
  const openEditDialog = async (dataset: Dataset) => {
    setEditingDataset(dataset);
    setIsEditOpen(true);

    try {
      const res = await fetch(`/api/datasets/${dataset.id}`);
      if (!res.ok) return;
      const full = (await res.json()) as Dataset;
      setEditingDataset((cur) => (cur?.id === dataset.id ? full : cur));
    } catch (error) {
      console.error("Failed to fetch dataset details:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/datasets/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteId(null);
        fetchDatasets();
      }
    } catch (error) {
      console.error("Failed to delete dataset:", error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="w-full flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <Boxes className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Admin Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                View Site
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* CLI Info Card */}
        <Card className="mb-8 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Terminal className="h-8 w-8 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  使用 CLI 工具上传数据集
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  数据集文件上传请使用命令行工具，支持保留完整目录结构和大文件上传：
                </p>
                <div className="mt-3 p-3 bg-slate-900 rounded-md font-mono text-sm text-slate-100">
                  <p className="text-slate-400"># 安装 CLI 工具</p>
                  <p>pip install -e ./cli</p>
                  <p className="text-slate-400 mt-2"># 配置并登录</p>
                  <p>datahub config api http://localhost:3000</p>
                  <p>datahub config cos</p>
                  <p>datahub login</p>
                  <p className="text-slate-400 mt-2"># 创建并上传数据集</p>
                  <p>datahub create &quot;My Dataset&quot; --author &quot;Your Name&quot;</p>
                  <p>datahub upload my-dataset ./path/to/folder</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Datasets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{datasets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatNumber(datasets.reduce((sum, d) => sum + d.downloads, 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Frames
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatNumber(datasets.reduce((sum, d) => sum + (d.totalFrames || 0), 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dataset Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Datasets
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Create Dialog */}
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Dataset
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
                  <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle>Create New Dataset</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    <DatasetForm 
                      onSubmit={handleCreate} 
                      formId="create-dataset-form"
                      hideSubmitButton
                    />
                  </div>
                  <div className="px-6 py-4 border-t shrink-0 flex justify-end">
                    <Button type="submit" form="create-dataset-form">
                      Create Dataset
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : datasets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No datasets found. Create your first dataset!
              </div>
            ) : (
              <div className="space-y-2">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{dataset.name}</h3>
                        {dataset.taskType && (
                          <Badge variant="secondary" className="text-xs">
                            {dataset.taskType}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {dataset.author} • {dataset.size || "N/A"} •{" "}
                        {formatNumber(dataset.downloads)} downloads
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog
                        open={isEditOpen && editingDataset?.id === dataset.id}
                        onOpenChange={(open) => {
                          setIsEditOpen(open);
                          if (!open) setEditingDataset(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(dataset)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
                          <DialogHeader className="px-6 py-4 border-b shrink-0">
                            <DialogTitle>Edit Dataset</DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-y-auto px-6 py-4">
                            {editingDataset && (
                              <DatasetForm
                                dataset={editingDataset}
                                onSubmit={handleUpdate}
                                formId="edit-dataset-form"
                                hideSubmitButton
                              />
                            )}
                          </div>
                          <div className="px-6 py-4 border-t shrink-0 flex justify-end">
                            <Button type="submit" form="edit-dataset-form">
                              Update Dataset
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={deleteId === dataset.id}
                        onOpenChange={(open) => !open && setDeleteId(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(dataset.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Delete Dataset</DialogTitle>
                          </DialogHeader>
                          <p className="text-muted-foreground">
                            Are you sure you want to delete &quot;{dataset.name}
                            &quot;? This action cannot be undone.
                          </p>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => setDeleteId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(dataset.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
