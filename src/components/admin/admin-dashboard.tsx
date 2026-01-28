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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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
                Total Rows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatNumber(datasets.reduce((sum, d) => sum + (d.rows || 0), 0))}
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
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Dataset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Dataset</DialogTitle>
                </DialogHeader>
                <DatasetForm onSubmit={handleCreate} />
              </DialogContent>
            </Dialog>
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
                        <Badge variant="secondary" className="text-xs">
                          {dataset.task}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {dataset.author} • {dataset.size} •{" "}
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
                            onClick={() => setEditingDataset(dataset)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Dataset</DialogTitle>
                          </DialogHeader>
                          {editingDataset && (
                            <DatasetForm
                              dataset={editingDataset}
                              onSubmit={handleUpdate}
                            />
                          )}
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
                        <DialogContent>
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
