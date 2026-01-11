import Docker from "dockerode";
import os from "os";
import fs from "fs/promises";
import path from "path";
import { Response } from "./core";

export interface ContainerMetadata {
  containerId: string;
  containerName: string;
  password: string;
  port: number;
  createdAt: string;
}

export interface ResourceUtilization {
  cpuLimit: number;
  cpuUsage: number;
  cpuPercent: number;
  memoryUsage: number;
  memoryLimit: number;
  memoryPercent: number;
  networkRx: number;
  networkTx: number;
  blockRead: number;
  blockWrite: number;
}

export interface EnrichedContainer {
  container: Docker.ContainerInfo;
  password: string | null;
  metadata: ContainerMetadata | null;
  stats: ResourceUtilization | null;
  logs: string[];
}

async function getContainerStats(
  docker: Docker,
  containerId: string
): Promise<ResourceUtilization | null> {
  try {
    const container = docker.getContainer(containerId);
    const stats = await container.stats({ stream: false });

    // Calculate CPU percentage
    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;
    const systemCpuDelta =
      stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus || 1;
    const cpuPercent =
      systemCpuDelta > 0 ? (cpuDelta / systemCpuDelta) * cpuCount * 100 : 0;

    // Memory usage
    const memoryUsage = stats.memory_stats.usage || 0;
    const memoryLimit = stats.memory_stats.limit || 0;
    const memoryPercent =
      memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;

    // Network stats
    let networkRx = 0;
    let networkTx = 0;
    if (stats.networks) {
      for (const iface of Object.values(stats.networks)) {
        networkRx += iface.rx_bytes || 0;
        networkTx += iface.tx_bytes || 0;
      }
    }

    // Block I/O stats
    let blockRead = 0;
    let blockWrite = 0;
    if (stats.blkio_stats?.io_service_bytes_recursive) {
      for (const entry of stats.blkio_stats.io_service_bytes_recursive) {
        if (entry.op === "read" || entry.op === "Read") {
          blockRead += entry.value;
        } else if (entry.op === "write" || entry.op === "Write") {
          blockWrite += entry.value;
        }
      }
    }

    return {
      cpuUsage: (cpuCount * 100 * cpuPercent / 100).toFixed(2) as unknown as number,
      cpuLimit: cpuCount * 100,
      cpuPercent: (cpuPercent * 100 / 100).toFixed(2) as unknown as number,
      memoryUsage,
      memoryLimit,
      memoryPercent: (memoryPercent * 100 / 100).toFixed(2) as unknown as number,
      networkRx,
      networkTx,
      blockRead,
      blockWrite,
    };
  } catch (err) {
    console.warn(`Failed to get stats for container ${containerId}:`, err);
    return null;
  }
}

async function getContainerLogs(
  docker: Docker,
  containerId: string,
  tailLines: number = 50
): Promise<string[]> {
  try {
    const container = docker.getContainer(containerId);
    const logsBuffer = await container.logs({
      stdout: true,
      stderr: true,
      tail: tailLines,
      timestamps: true,
    });

    // Docker logs come with a header for each line (8 bytes)
    // We need to parse them properly
    const logsString = logsBuffer.toString("utf-8");
    const lines = logsString
      .split("\n")
      .map((line) => {
        // Remove Docker stream header (first 8 bytes if present)
        if (line.length > 8) {
          const cleaned = line.substring(8).trim();
          return cleaned || line.trim();
        }
        return line.trim();
      })
      .filter((line) => line.length > 0);

    return lines;
  } catch (err) {
    console.warn(`Failed to get logs for container ${containerId}:`, err);
    return [];
  }
}

export async function listContainers(options?: {
  includeStats?: boolean;
  includeLogs?: boolean;
  logTailLines?: number;
}) {
  const {
    includeStats = true,
    includeLogs = true,
    logTailLines = 50,
  } = options || {};

  const docker = new Docker({
    host: "127.0.0.1",
    port: 2375,
  });

  try {
    const containers = await docker.listContainers({
      all: true,
      filters: { ancestor: ["codercom/code-server"] },
    });

    // Load metadata for all containers
    const homedir = os.homedir();
    const metadataDir = path.join(homedir, ".cloud-ide", ".metadata");
    const metadataMap = new Map<string, ContainerMetadata>();

    try {
      const files = await fs.readdir(metadataDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            const filePath = path.join(metadataDir, file);
            const content = await fs.readFile(filePath, "utf-8");
            const metadata: ContainerMetadata = JSON.parse(content);
            metadataMap.set(metadata.containerId, metadata);
          } catch (err) {
            console.warn(`Failed to read metadata file ${file}:`, err);
          }
        }
      }
    } catch (err) {
      // Metadata directory doesn't exist yet, that's okay
      console.warn("Metadata directory not found:", err);
    }

    // Enrich containers with metadata, stats, and logs
    const enrichedContainers = await Promise.all(
      containers.map(async (container) => {
        const metadata = metadataMap.get(container.Id);
        const isRunning =
          container.State === "running" ||
          container.Status.toLowerCase().includes("up");

        // Only fetch stats and logs for running containers
        const stats =
          includeStats && isRunning
            ? await getContainerStats(docker, container.Id)
            : null;

        const logs =
          includeLogs && isRunning
            ? await getContainerLogs(docker, container.Id, logTailLines)
            : [];

        return {
          ...container,
          password: metadata?.password || null,
          metadata: metadata || null,
          stats,
          logs,
        };
      })
    );

    return Response.json(
      enrichedContainers,
      200,
      "Containers retrieved successfully"
    );
  } catch (error) {
    return Response.error([], 500, `Failed to list containers: ${error}`);
  }
}
