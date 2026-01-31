"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Copy,
  ChevronLeft,
  Database,
  Code2,
  Calendar,
  HardDrive,
  Scale,
  Check,
  Film,
  Layers,
  Gauge,
  Bot,
  Target,
  Eye,
  Zap,
  Box,
  FileText,
  BookOpen,
  Terminal,
} from "lucide-react";
import { Dataset } from "@/types/dataset";
import { formatNumber } from "@/data/datasets";
import { FilePreview } from "@/components/dataset/file-preview";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

interface DatasetDetailClientProps {
  dataset: Dataset;
}

export function DatasetDetailClient({ dataset }: DatasetDetailClientProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const isCopied = (text: string) => copiedText === text;

  const handleDownloadClick = () => {
    setActiveTab("code");
    // Wait for tab content to render, then scroll to CLI section
    setTimeout(() => {
      const cliSection = document.getElementById("cli-download");
      if (cliSection) {
        cliSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const pythonCode = `from lerobot.common.datasets.lerobot_dataset import LeRobotDataset

# Load the dataset
dataset = LeRobotDataset("embodied-datahub/${dataset.id}")

# Access episode data
episode = dataset[0]
print(f"Episode keys: {episode.keys()}")

# Iterate through frames
for i in range(len(dataset)):
    frame = dataset[i]
    observation = frame["observation.state"]
    action = frame["action"]
    print(f"Frame {i}: obs shape {observation.shape}, action shape {action.shape}")`;

  const huggingfaceCode = `from datasets import load_dataset

# Load from Hugging Face Hub
dataset = load_dataset("embodied-datahub/${dataset.id}")

# Access train split
train_data = dataset["train"]
print(f"Number of episodes: {len(train_data)}")`;

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

              {/* Format & Robot & Task Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={dataset.datasetFormat === "lerobot" ? "default" : "secondary"}>
                  {dataset.datasetFormat === "lerobot" ? "LeRobot" : "Corobot"}
                </Badge>
                <Badge variant="outline">{dataset.robotType}</Badge>
                <Badge variant="outline">{dataset.taskType}</Badge>
                {dataset.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-muted/50">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Film className="h-4 w-4" />
                  {formatNumber(dataset.totalEpisodes)} episodes
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  {formatNumber(dataset.totalFrames)} frames
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {formatNumber(dataset.downloads)} downloads
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button className="gap-2" onClick={handleDownloadClick}>
                <Download className="h-4 w-4" />
                Download Dataset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start mb-6 flex-wrap">
                <TabsTrigger value="overview" className="gap-2">
                  <Database className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <Code2 className="h-4 w-4" />
                  Use Dataset
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {dataset.readme && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        README
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xl font-bold mt-5 mb-3">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-lg font-semibold mt-4 mb-2">
                                {children}
                              </h3>
                            ),
                            h4: ({ children }) => (
                              <h4 className="text-base font-semibold mt-3 mb-2">
                                {children}
                              </h4>
                            ),
                            p: ({ children }) => (
                              <p className="my-3 leading-relaxed">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="my-3 ml-6 list-disc space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="my-3 ml-6 list-decimal space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="leading-relaxed">{children}</li>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                className="text-primary underline hover:no-underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                            code: ({ className, children, ...props }) => {
                              const isInline = !className;
                              if (isInline) {
                                return (
                                  <code
                                    className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            pre: ({ children }) => (
                              <pre className="my-4 p-4 rounded-lg bg-muted overflow-x-auto text-sm">
                                {children}
                              </pre>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="my-4 pl-4 border-l-4 border-muted-foreground/30 text-muted-foreground italic">
                                {children}
                              </blockquote>
                            ),
                            table: ({ children }) => (
                              <div className="my-4 overflow-x-auto">
                                <table className="w-full border-collapse border border-border text-sm">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-muted">{children}</thead>
                            ),
                            th: ({ children }) => (
                              <th className="px-3 py-2 text-left font-semibold border border-border">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-3 py-2 border border-border">
                                {children}
                              </td>
                            ),
                            hr: () => <hr className="my-6 border-border" />,
                            img: ({ src, alt }) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={src || ""}
                                alt={alt || ""}
                                className="my-4 max-w-full rounded-lg"
                              />
                            ),
                          }}
                        >
                          {dataset.readme}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Observation Types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Observation Space
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dataset.observationTypes?.map((obs, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div>
                            <code className="text-sm font-medium">{obs.name}</code>
                            {obs.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {obs.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {obs.shape && (
                              <Badge variant="outline" className="text-xs font-mono">
                                {obs.shape}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs capitalize">
                              {obs.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Space */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Action Space
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Type</p>
                        <p className="font-medium capitalize">{dataset.actionSpace?.type}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Dimensions</p>
                        <p className="font-medium">{dataset.actionSpace?.dimensions}</p>
                      </div>
                    </div>
                    {dataset.actionSpace?.description && (
                      <p className="text-sm text-muted-foreground mt-3">
                        {dataset.actionSpace.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-6">
                <FilePreview files={dataset.files || []} datasetId={dataset.id} />
              </TabsContent>

              {/* Code Tab */}
              <TabsContent value="code" className="space-y-6">
                {/* CLI Download */}
                <Card id="cli-download">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      Download with CLI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Use the DataHub CLI tool to download datasets directly to your local machine.
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">1. Install CLI</p>
                        <div className="relative">
                          <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                            <code>pip install embodied_datahub_cli-0.1.0-py3-none-any.whl</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1.5 right-1.5 h-7 w-7"
                            onClick={() => copyToClipboard("pip install embodied_datahub_cli-0.1.0-py3-none-any.whl")}
                          >
                            {isCopied("pip install embodied_datahub_cli-0.1.0-py3-none-any.whl") ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <a
                          href="/downloads/embodied_datahub_cli-0.1.0-py3-none-any.whl"
                          download
                          className="inline-flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
                        >
                          <Download className="h-4 w-4" />
                          Download CLI Package (.whl)
                        </a>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">2. Configure API URL</p>
                        <div className="relative">
                          <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                            <code>{`datahub config api ${typeof window !== 'undefined' ? window.location.origin : 'https://your-datahub-url.com'}`}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1.5 right-1.5 h-7 w-7"
                            onClick={() => copyToClipboard(`datahub config api ${typeof window !== 'undefined' ? window.location.origin : 'https://your-datahub-url.com'}`)}
                          >
                            {copiedText?.startsWith("datahub config api") ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">3. Download Dataset</p>
                        <div className="relative">
                          <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                            <code>{`datahub download ${dataset.id}`}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1.5 right-1.5 h-7 w-7"
                            onClick={() => copyToClipboard(`datahub download ${dataset.id}`)}
                          >
                            {isCopied(`datahub download ${dataset.id}`) ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          No COS credentials required for public datasets.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Load with LeRobot
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
                        {isCopied(pythonCode) ? (
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
                    <CardTitle className="text-lg">Load with Hugging Face</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{huggingfaceCode}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(huggingfaceCode)}
                      >
                        {isCopied(huggingfaceCode) ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
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
                    <Box className="h-4 w-4" />
                    Format
                  </span>
                  <Badge variant={dataset.datasetFormat === "lerobot" ? "default" : "secondary"}>
                    {dataset.datasetFormat === "lerobot" ? "LeRobot" : "Corobot"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Robot
                  </span>
                  <span className="text-sm font-medium">{dataset.robotType}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Task
                  </span>
                  <span className="text-sm font-medium">{dataset.taskType}</span>
                </div>
                <Separator />
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
                    <Scale className="h-4 w-4" />
                    License
                  </span>
                  <span className="text-sm font-medium">{dataset.license}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    FPS
                  </span>
                  <span className="text-sm font-medium">{dataset.fps}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Updated
                  </span>
                  <span className="text-sm font-medium">{dataset.updatedAt}</span>
                </div>
                {dataset.environment && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Environment
                      </span>
                      <span className="text-sm font-medium">{dataset.environment}</span>
                    </div>
                  </>
                )}
                {dataset.simulationFramework && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Simulator
                      </span>
                      <span className="text-sm font-medium">{dataset.simulationFramework}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Episode Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Episodes</span>
                    <span className="text-sm font-medium">{formatNumber(dataset.totalEpisodes)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Frames</span>
                    <span className="text-sm font-medium">{formatNumber(dataset.totalFrames)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Episode Length</span>
                    <span className="text-sm font-medium">
                      {dataset.totalEpisodes > 0 
                        ? Math.round(dataset.totalFrames / dataset.totalEpisodes) 
                        : 0} frames
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Observations</span>
                    <span className="text-sm font-medium">{dataset.observationTypes?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Action Dims</span>
                    <span className="text-sm font-medium">{dataset.actionSpace?.dimensions || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
