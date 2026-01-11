"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  EyeOffIcon,
  EyeIcon,
  TerminalIcon,
  CpuIcon,
  MemoryStickIcon,
  NetworkIcon,
  HardDriveIcon,
  PauseIcon,
  PlayIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";
import Dockerode from "dockerode";
import { VscVscode, VscVscodeInsiders } from "react-icons/vsc";
import {
  ContainerMetadata,
  ResourceUtilization,
} from "@/functions/list_containers";
import { bytesToHumanReadable } from "@/lib/units";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import {
  deleteContainer,
  restartContainer,
  startContainer,
  stopContainer,
} from "@/functions/power_container";
import { ResponseData } from "@/functions/core";

type ContainerInfoWithPassword = Dockerode.ContainerInfo & {
  password?: string | null;
  metadata?: ContainerMetadata | null;
  stats?: ResourceUtilization | null;
  logs?: string[];
  tools?: {
    name: string;
    icon?: React.ReactNode;
    color?: string;
    disabled?: boolean;
  }[];
};

type WorkspaceCardProps = {
  container: ContainerInfoWithPassword;
  viewMode?: "grid" | "list";
};

const getStatus = (status: string) =>
  status.toLowerCase().includes("up") ||
  status.toLowerCase().includes("running")
    ? "up"
    : status.toLowerCase().includes("exited") ||
      status.toLowerCase().includes("stopped")
    ? "down"
    : "idk";

const defaultTools = [
  {
    name: "VS Code Desktop",
    icon: <VscVscode className="size-6 text-blue-500" />,
    color: "bg-blue-500",
    disabled: true,
  },
  {
    name: "VS Code Web",
    icon: <VscVscodeInsiders className="size-6 text-blue-400" />,
    color: "bg-blue-400",
    disabled: false,
  },
  {
    name: "Terminal",
    icon: <TerminalIcon className="size-6" />,
    color: "bg-gray-500",
    disabled: true,
  },
];

export function WorkspaceCard({
  container,
  viewMode = "grid",
}: WorkspaceCardProps) {
  const [logsExpanded, setLogsExpanded] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const containerName = container.Names[0]?.replace("/", "") || "Unknown";
  const workspaceUrl = `http://${container.Id.substring(0, 12)}-${
    container.Ports[0]?.PublicPort
  }.localhost:3000?folder=/home/coder/workspace`;
  const status = getStatus(container.Status);

  // Measure actual response time by pinging the container's port
  React.useEffect(() => {
    const measureResponseTime = async () => {
      if (status !== "up" || !container.Ports[0]?.PublicPort) {
        setResponseTime(null);
        return;
      }

      setIsChecking(true);
      const pingUrl = `http://${container.Id.substring(0, 12)}-${
        container.Ports[0].PublicPort
      }.localhost:3000/healthz`;

      try {
        const start = performance.now();
        await fetch(pingUrl, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });
        const end = performance.now();
        setResponseTime(Math.round(end - start));
      } catch {
        // If fetch fails, try with a simple request
        try {
          const start = performance.now();
          await fetch(pingUrl, { mode: "no-cors", cache: "no-store" });
          const end = performance.now();
          setResponseTime(Math.round(end - start));
        } catch {
          setResponseTime(null);
        }
      } finally {
        setIsChecking(false);
      }
    };

    measureResponseTime();

    // Re-check every 30 seconds
    const interval = setInterval(measureResponseTime, 30000);
    return () => clearInterval(interval);
  }, [container.Id, container.Ports, status]);

  const getResponseTimeDisplay = () => {
    if (isChecking) return "...";
    if (responseTime === null) return "—";
    return `${responseTime}ms`;
  };

  const tools = container.tools || defaultTools;

  function handle_container_action(
    action: "start" | "stop" | "restart" | "delete"
  ) {
    try {
      const actions = {
        start: () => startContainer(container.Id, "/"),
        stop: () => stopContainer(container.Id, "/", 10),
        restart: () => restartContainer(container.Id, "/", 10),
        delete: () => deleteContainer(container.Id, "/", false, false),
      };
      const actionFunction = actions[action];

      if (!actionFunction) {
        toast.error(`Unknown action: ${action}`);
        return;
      }

      const promise = new Promise<{ containerId: string; status: string }>(
        async (resolve, reject) => {
          const res = await actionFunction();
          if (res && res.status === 200) {
            resolve(res.payload);
          } else {
            reject(res.message || "Unknown error");
          }
        }
      );

      toast.promise(promise, {
        loading: `${
          action.charAt(0).toUpperCase() + action.slice(1)
        }ing container...`,
        success: (data) => `Container ${data.status} successfully`,
        error: (err) => `Failed to ${action} container: ${err}`,
      });
    } catch (error) {
      console.error(`Error restarting container "${container.Id}":`, error);
      toast.error(`Failed to ${action} container: ${error}`);
    }
  }

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-200 bg-background border-2 gap-0",
        {
          "border-l-4 border-l-green-500": status === "up",
          "border-l-4 border-l-yellow-500": status === "down",
          "border-l-4 border-l-blue-500": status === "idk",
        }
      )}
    >
      {/* Header with status indicator */}
      <CardHeader className="px-4">
        <div className="flex items-baseline gap-2">
          <div
            className={cn(
              "relative z-10 w-1.5 aspect-square rounded-full mr-2",
              {
                "bg-green-500 shadow-green-500/50": status === "up",
                "bg-yellow-500 shadow-yellow-500/50": status === "down",
                "bg-blue-500 shadow-blue-500/50": status === "idk",
              },
              "before:absolute before:size-4 before:rounded-full before:animate -ping before:bg-current before:opacity-30",
              "before:-inset-1/2 before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2",
              {
                "before:bg-green-500": status === "up",
                "before:bg-yellow-500": status === "down",
                "before:bg-blue-500": status === "idk",
              }
            )}
          />
          <span className="font-semibold text-white">{containerName}</span>
          <span className="text-xs text-muted-foreground">
            {getResponseTimeDisplay()}
          </span>
          <span
            className={cn(
              "ml-auto text-xs px-2 py-1 rounded-md font-mono font-medium",
              {
                "text-green-500 bg-green-500/10 border border-green-500/20":
                  status === "up",
                "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20":
                  status === "down",
                "text-blue-500 bg-blue-500/10 border border-blue-500/20":
                  status === "idk",
              }
            )}
          >
            {container.Status}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4">
        <div className="flex justify-between items-center mb-2">
          <div></div>
          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <div
              className={cn(
                "flex items-center",
                "border pl-2 rounded-lg overflow-hidden bg-muted/20 border-muted"
              )}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={container.password || "Not Set"}
                readOnly
                className="outline-none bg-transparent max-w-60 w-full"
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none border-l"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none border-l"
                onClick={() => {
                  navigator.clipboard.writeText(container.password || "");
                  toast.success("Password copied to clipboard");
                }}
              >
                <CopyIcon />
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-auto p-2 cursor-pointer text-muted-foreground hover:text-white"
              onClick={() =>
                handle_container_action(status === "up" ? "stop" : "start")
              }
              asChild
            >
              {status == "up" ? (
                <PauseIcon className="size-5" />
              ) : (
                <PlayIcon className="size-5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={cn("h-auto p-2 cursor-pointer text-muted-foreground", {
                "opacity-50 cursor-not-allowed hover:text-muted-foreground touch-none":
                  status !== "up",
              })}
              disabled={status !== "up"}
              onClick={() => handle_container_action("restart")}
              asChild
            >
              <RefreshCwIcon className="size-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={cn("h-auto p-2 cursor-pointer text-muted-foreground", {
                "opacity-50 cursor-not-allowed hover:text-muted-foreground touch-none":
                  status === "up",
              })}
              disabled={status === "up"}
              onClick={() => handle_container_action("delete")}
              asChild
            >
              <Trash2Icon className="size-5 text-red-300" />
            </Button>
          </div>
        </div>

        {/* Tool Badges */}
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground/70 font-medium mr-2">
            Open With:
          </span>
          <span className="grow flex-1 h-0.5 bg-border mt-1.5" />
        </div>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool, idx) => (
            <Button
              key={idx}
              variant="outline"
              disabled={status !== "up" || tool.disabled}
              size="sm"
              className={cn(
                "h-auto px-2.5 py-1 text-sm text-muted-foreground hover:text-white",
                {
                  "opacity-50 cursor-not-allowed hover:text-muted-foreground touch-none":
                    status !== "up" || tool.disabled,
                }
              )}
              asChild
            >
              <Link
                href={status === "up" ? workspaceUrl : "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tool.icon && (
                  <span className="rounded mr-1.5">{tool.icon}</span>
                )}
                {tool.name}
              </Link>
            </Button>
          ))}
        </div>

        {/* Resource Utilization */}
        {container.stats && status === "up" && (
          <div className="space-y-3 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-muted-foreground">
              {/* CPU */}
              <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-muted">
                <div className="flex items-stretch mb-3">
                  <div className="grid place-items-center size-9 mr-3">
                    <CpuIcon className="size-9 mt-0.5" />
                  </div>

                  <div className="gap-2 justify-between h-full">
                    <div className="text-sm font-semibold">CPU</div>
                    <div className="font-mono text-xs truncate">
                      {container.stats.cpuUsage}% / {container.stats.cpuLimit}%
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 text-xs">
                  <Progress
                    value={container.stats.cpuPercent}
                    className="h-1.5"
                  />
                  {container.stats.cpuPercent}%
                </div>
              </div>

              {/* Memory */}
              <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-muted">
                <div className="flex items-stretch mb-3">
                  <div className="grid place-items-center size-9 mr-3">
                    <MemoryStickIcon className="size-9 mt-0.5" />
                  </div>

                  <div className="gap-2 justify-between h-full">
                    <div className="text-sm font-semibold">Memory</div>
                    <div className="font-mono text-xs truncate">
                      {bytesToHumanReadable(container.stats.memoryUsage)} /{" "}
                      {bytesToHumanReadable(container.stats.memoryLimit)}
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 text-xs">
                  <Progress
                    value={container.stats.memoryPercent}
                    className="h-1.5"
                  />
                  {container.stats.memoryPercent}%
                </div>
              </div>

              {/* Network */}
              <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-muted grid place-items-center">
                <div className="flex items-stretch w-full">
                  <div className="grid place-items-center w-9 min-h-9 h-auto mr-3">
                    <NetworkIcon className="size-9 mt-0.5" />
                  </div>

                  <div className="gap-2 justify-between h-full">
                    <div className="text-sm font-semibold">Network</div>
                    <div className="font-mono text-xs truncate flex flex-wrap gap-x-2">
                      <span>
                        ↓ {bytesToHumanReadable(container.stats.networkRx)}
                      </span>
                      <span>
                        ↑ {bytesToHumanReadable(container.stats.networkTx)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disk I/O */}
              <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-muted grid place-items-center">
                <div className="flex items-stretch w-full">
                  <div className="grid place-items-center size-9 mr-3">
                    <HardDriveIcon className="size-9 mt-0.5" />
                  </div>

                  <div className="gap-2 justify-between h-full">
                    <div className="text-sm font-semibold">Disk I/O</div>
                    <div className="font-mono text-xs truncate">
                      {bytesToHumanReadable(container.stats.blockRead)} ↓ ↑{" "}
                      {bytesToHumanReadable(container.stats.blockWrite)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Section */}
        <div className="border-t border-border pt-3">
          <button
            onClick={() => setLogsExpanded(!logsExpanded)}
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {logsExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
            Logs
          </button>
          <div
            className={cn(
              "mt-2 px-3 rounded bg-muted/30 border-muted-foreground overflow-hidden",
              {
                "max-h-64 py-3 overflow-y-auto": logsExpanded,
                "max-h-0 py-0 overflow-hidden": !logsExpanded,
              },
              "transition-all duration-300 ease-in-out"
            )}
          >
            {/* Server Logs */}
            {container.logs && container.logs.length > 0 ? (
              <div className="space-y-0.5">
                {container.logs.map((log, idx) => (
                  <p
                    key={idx}
                    className={cn(
                      "text-xs font-mono leading-relaxed break-all",
                      log.toLowerCase().includes("error")
                        ? "text-red-400"
                        : log.toLowerCase().includes("warn")
                        ? "text-yellow-400"
                        : "text-zinc-400"
                    )}
                  >
                    {log}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No logs available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
