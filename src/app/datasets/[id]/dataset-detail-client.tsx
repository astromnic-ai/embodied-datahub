"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  Heart,
  Share2,
  Copy,
  ChevronLeft,
  Database,
  FileText,
  Code2,
  Table2,
  GitBranch,
  Calendar,
  HardDrive,
  Scale,
  ExternalLink,
  Check,
} from "lucide-react";
import { Dataset } from "@/types/dataset";
import { formatNumber } from "@/data/datasets";
import { useState } from "react";

interface DatasetDetailClientProps {
  dataset: Dataset;
}

export function DatasetDetailClient({ dataset }: DatasetDetailClientProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pythonCode = `from datasets import load_dataset

# Load the dataset
dataset = load_dataset("embodied-datahub/${dataset.id}")

# Access the train split
train_data = dataset["train"]

# Iterate through examples
for example in train_data:
    print(example)`;

  const cliCode = `# Install the datasets library
pip install datasets

# Download using CLI
datasets-cli download embodied-datahub/${dataset.id}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Datasets
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              {/* Author & Title */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {dataset.author.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {dataset.author}
                  </p>
                  <h1 className="text-2xl font-bold">{dataset.name}</h1>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-4 max-w-2xl">
                {dataset.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge>{dataset.task}</Badge>
                {dataset.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {formatNumber(dataset.downloads)} downloads
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {formatNumber(dataset.likes)} likes
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Updated {dataset.updatedAt}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Download Dataset
              </Button>
              <div className="flex gap-2">
                <Button
                  variant={liked ? "secondary" : "outline"}
                  className="flex-1 gap-2"
                  onClick={() => setLiked(!liked)}
                >
                  <Heart
                    className={`h-4 w-4 ${liked ? "fill-current text-red-500" : ""}`}
                  />
                  {liked ? "Liked" : "Like"}
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="dataset" className="w-full">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="dataset" className="gap-2">
                  <Database className="h-4 w-4" />
                  Dataset Card
                </TabsTrigger>
                <TabsTrigger value="viewer" className="gap-2">
                  <Table2 className="h-4 w-4" />
                  Viewer
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <Code2 className="h-4 w-4" />
                  Use Dataset
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Files
                </TabsTrigger>
              </TabsList>

              {/* Dataset Card Tab */}
              <TabsContent value="dataset" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dataset Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                    <p>{dataset.description}</p>

                    <h4>Intended Use</h4>
                    <p>
                      This dataset is designed for research in {dataset.task.toLowerCase()} 
                      tasks. It can be used for training and evaluating machine learning 
                      models in embodied AI and robotics applications.
                    </p>

                    <h4>Dataset Structure</h4>
                    <p>
                      The dataset contains {formatNumber(dataset.rows || 0)} examples 
                      split across {dataset.splits?.length || 0} data splits.
                    </p>

                    <h4>Citation</h4>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`@dataset{${dataset.id.replace(/-/g, "_")},
  title={${dataset.name}},
  author={${dataset.author}},
  year={2026},
  publisher={Embodied DataHub}
}`}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Viewer Tab */}
              <TabsContent value="viewer" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Table2 className="h-5 w-5" />
                      Data Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="w-full">
                      <div className="rounded-lg border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              {dataset.previewData &&
                                Object.keys(dataset.previewData[0]).map(
                                  (key) => (
                                    <th
                                      key={key}
                                      className="px-4 py-3 text-left font-medium"
                                    >
                                      {key}
                                    </th>
                                  )
                                )}
                            </tr>
                          </thead>
                          <tbody>
                            {dataset.previewData?.map((row, i) => (
                              <tr key={i} className="border-t">
                                {Object.values(row).map((value, j) => (
                                  <td
                                    key={j}
                                    className="px-4 py-3 font-mono text-xs"
                                  >
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ScrollArea>
                    <p className="text-xs text-muted-foreground mt-4">
                      Showing first 3 rows of {formatNumber(dataset.rows || 0)}{" "}
                      total rows
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Code Tab */}
              <TabsContent value="code" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Load with Python
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{pythonCode}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(pythonCode)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Command Line</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{cliCode}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(cliCode)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GitBranch className="h-5 w-5" />
                      Files and Versions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dataset.splits?.map((split) => (
                        <div
                          key={split.name}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">
                                {split.name}.{dataset.format}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatNumber(split.rows)} rows
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">README.md</p>
                            <p className="text-xs text-muted-foreground">
                              Documentation
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Dataset Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dataset Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Size
                  </span>
                  <span className="text-sm font-medium">{dataset.size}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Format
                  </span>
                  <Badge variant="secondary">{dataset.format}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    License
                  </span>
                  <span className="text-sm font-medium">{dataset.license}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Rows
                  </span>
                  <span className="text-sm font-medium">
                    {formatNumber(dataset.rows || 0)}
                  </span>
                </div>
                {dataset.language && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Language
                      </span>
                      <span className="text-sm font-medium">
                        {dataset.language}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Data Splits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Splits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataset.splits?.map((split) => (
                    <div key={split.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize">{split.name}</span>
                        <span className="text-muted-foreground">
                          {formatNumber(split.rows)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(split.rows / (dataset.rows || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dataset.features?.map((feature) => (
                    <div
                      key={feature.name}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <code className="text-sm">{feature.name}</code>
                      <Badge variant="outline" className="text-xs">
                        {feature.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
