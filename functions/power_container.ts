"use server";

import Docker from "dockerode";
import { Response } from "./core";
import { revalidatePath } from "next/cache";

/**
 * Start a stopped container
 * @param containerId - The ID or name of the container to start
 * @param pathToRevalidate - Path to revalidate after the operation (default: "/")
 */
export async function startContainer(
  containerId: string,
  pathToRevalidate: string = "/"
) {
  const docker = new Docker({
    host: "127.0.0.1",
    port: 2375,
  });

  console.log(
    `\n==========================================\nStarting container "${containerId}"`
  );

  try {
    const container = docker.getContainer(containerId);
    
    // Check if container exists
    const containerInfo = await container.inspect();
    
    // Check if already running
    if (containerInfo.State.Running) {
      console.log(`Container "${containerId}" is already running`);
      return Response.json(
        { containerId, status: "already_running" },
        200,
        "Container is already running"
      );
    }

    await container.start();
    console.log(`Container "${containerId}" started successfully`);

    revalidatePath(pathToRevalidate);

    return Response.json(
      { containerId, status: "started" },
      200,
      "Container started successfully"
    );
  } catch (error) {
    console.error(`Error starting container "${containerId}":`, error);
    return Response.error(
      { containerId, status: "error" },
      500,
      `Failed to start container: ${error}`
    );
  }
}

/**
 * Stop a running container
 * @param containerId - The ID or name of the container to stop
 * @param pathToRevalidate - Path to revalidate after the operation (default: "/")
 * @param timeout - Seconds to wait before killing the container (default: 10)
 */
export async function stopContainer(
  containerId: string,
  pathToRevalidate: string = "/",
  timeout: number = 10
) {
  const docker = new Docker({
    host: "127.0.0.1",
    port: 2375,
  });

  console.log(
    `\n==========================================\nStopping container "${containerId}"`
  );

  try {
    const container = docker.getContainer(containerId);
    
    // Check if container exists
    const containerInfo = await container.inspect();
    
    // Check if already stopped
    if (!containerInfo.State.Running) {
      console.log(`Container "${containerId}" is already stopped`);
      return Response.json(
        { containerId, status: "already_stopped" },
        200,
        "Container is already stopped"
      );
    }

    await container.stop({ t: timeout });
    console.log(`Container "${containerId}" stopped successfully`);

    revalidatePath(pathToRevalidate);

    return Response.json(
      { containerId, status: "stopped" },
      200,
      "Container stopped successfully"
    );
  } catch (error) {
    console.error(`Error stopping container "${containerId}":`, error);
    return Response.error(
      { containerId, status: "error" },
      500,
      `Failed to stop container: ${error}`
    );
  }
}

/**
 * Restart a container (stop + start)
 * @param containerId - The ID or name of the container to restart
 * @param pathToRevalidate - Path to revalidate after the operation (default: "/")
 * @param timeout - Seconds to wait before killing the container during stop (default: 10)
 */
export async function restartContainer(
  containerId: string,
  pathToRevalidate: string = "/",
  timeout: number = 10
) {
  const docker = new Docker({
    host: "127.0.0.1",
    port: 2375,
  });

  console.log(
    `\n==========================================\nRestarting container "${containerId}"`
  );

  try {
    const container = docker.getContainer(containerId);
    
    // Check if container exists
    await container.inspect();

    await container.restart({ t: timeout });
    console.log(`Container "${containerId}" restarted successfully`);

    revalidatePath(pathToRevalidate);

    return Response.json(
      { containerId, status: "restarted" },
      200,
      "Container restarted successfully"
    );
  } catch (error) {
    console.error(`Error restarting container "${containerId}":`, error);
    return Response.error(
      { containerId, status: "error" },
      500,
      `Failed to restart container: ${error}`
    );
  }
}

/**
 * Delete a container (removes it permanently)
 * @param containerId - The ID or name of the container to delete
 * @param pathToRevalidate - Path to revalidate after the operation (default: "/")
 * @param force - Force removal of running container (default: false)
 * @param removeVolumes - Remove associated volumes (default: false)
 */
export async function deleteContainer(
  containerId: string,
  pathToRevalidate: string = "/",
  force: boolean = false,
  removeVolumes: boolean = false
) {
  const docker = new Docker({
    host: "127.0.0.1",
    port: 2375,
  });

  console.log(
    `\n==========================================\nDeleting container "${containerId}"`
  );

  try {
    const container = docker.getContainer(containerId);

    // Check if container exists
    const containerInfo = await container.inspect();

    // If container is running and force is not enabled, return error
    if (containerInfo.State.Running && !force) {
      console.log(`Container "${containerId}" is running. Use force=true to remove.`);
      return Response.error(
        { containerId, status: "running" },
        400,
        "Container is running. Stop it first or use force=true to remove."
      );
    }

    await container.remove({ force, v: removeVolumes });
    console.log(`Container "${containerId}" deleted successfully`);

    revalidatePath(pathToRevalidate);

    return Response.json(
      { containerId, status: "deleted" },
      200,
      "Container deleted successfully"
    );
  } catch (error) {
    console.error(`Error deleting container "${containerId}":`, error);
    return Response.error(
      { containerId, status: "error" },
      500,
      `Failed to delete container: ${error}`
    );
  }
}
