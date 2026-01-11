"use server";

import Docker from "dockerode";
import os from "os";
import fs from "fs/promises";
import path from "path";
import { findFreePort } from "@/lib/port";
import { Response } from "./core";
import { revalidatePath } from "next/cache";

export async function newContainer(
  containerName: string,
  pathToRevalidate: string = "/"
) {
  const docker = new Docker({
    host: "127.0.0.1",
    port: 2375,
  });
  const homedir = os.homedir();

  const minPort = 8000;
  const maxPort = 8999;

  const availablePort = await findFreePort({ range: [minPort, maxPort] });

  if (!availablePort) {
    return Response.error(null, 500, "No available ports found");
  }

  console.log(
    `\n==========================================\nCreating container "${containerName}" on port ${availablePort}`
  );

  console.log("checking for image...");
  const imageName = "codercom/code-server";

  try {
    const image = docker.getImage(imageName);
    await image.inspect();
    console.log("Image found:", imageName);
  } catch {
    console.log("Image not found, pulling...");
    await new Promise<void>((resolve, reject) => {
      docker.pull(
        imageName,
        (err: Error | null, stream: NodeJS.ReadableStream) => {
          if (err) return reject(err);
          docker.modem.followProgress(stream, (err) => {
            if (err) return reject(err);
            console.log("Image pulled successfully");
            resolve();
          });
        }
      );
    }).catch((error) => {
      console.error("Error pulling image:", error);
      return Response.error(null, 500, `Failed to pull image: ${error}`);
    });
  }

  try {
    const container = await docker.createContainer({
      Image: "codercom/code-server",
      name: containerName,
      HostConfig: {
        PortBindings: {
          "8080/tcp": [
            {
              HostIp: "127.0.0.1",
              HostPort: availablePort.toString(),
            },
          ],
        },
        Binds: [
          `${homedir}/.cloud-ide/.config:/home/coder/.config`,
          `${homedir}/.cloud-ide/${containerName}:/home/coder`,
        ],
      },
      Labels: {
        "cloud-ide.port": availablePort.toString(),
        "cloud-ide.name": containerName,
      },
      // Env: [`DOCKER_USER=root`],
    });

    await container.start();
    console.log("container started...");

    const createdir = await container.exec({
      Cmd: ["mkdir", "workspace"],
      AttachStdin: true,
      AttachStdout: true,
    });
    console.log("create workspace dir... DONE!");

    const streamcreatedir = await createdir.start({});
    streamcreatedir.on("data", (chunk) => {
      const output = chunk.toString();
      console.log("output", output);
    });

    const data = await container.exec({
      Cmd: ["cat", "/home/coder/.config/code-server/config.yaml"],
      AttachStdin: true,
      AttachStdout: true,
    });

    const stream = await data.start({});
    let password = "";

    stream.on("data", (chunk) => {
      const output = chunk.toString();
      const lines = output.split("\n");
      for (const line of lines) {
        if (line.startsWith("password:")) {
          // Extracting the password from the line
          password = line.split(":")[1].trim();
          break;
        }
      }
    });

    console.log("password found...", password);

    // Waiting for the stream to end before sending the response
    await new Promise((resolve) => {
      stream.on("end", () => {
        resolve({});
      });
    });

    // Store password and metadata in a file for later retrieval
    if (password) {
      try {
        const metadataDir = path.join(homedir, ".cloud-ide", ".metadata");
        await fs.mkdir(metadataDir, { recursive: true });
        
        const metadataFile = path.join(metadataDir, `${container.id}.json`);
        const metadata = {
          containerId: container.id,
          containerName,
          password,
          port: availablePort,
          createdAt: new Date().toISOString(),
        };
        
        await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));
        console.log("Password stored in metadata file");
      } catch (metadataError) {
        console.warn("Failed to store metadata:", metadataError);
        // Continue even if metadata storage fails
      }
    }

    console.info("workspace created... DONE! sending response...");
    console.info(`\n==========================================
 - Container ID: ${container.id}
 - Container Name: ${containerName}
 - Port: ${availablePort}
 - Password: ${password}
 - Container URL: http://${container.id.substring(
   0,
   12
 )}-${availablePort}.localhost:3000?folder=/home/coder/workspace
==========================================`);

    // Revalidate the specified path to update the container list
    if (pathToRevalidate) revalidatePath(pathToRevalidate);

    return Response.json(
      {
        containerId: container.id,
        containerName,
        port: availablePort,
        password,
        url: `http://${container.id.substring(
          0,
          12
        )}-${availablePort}.localhost:3000?folder=/home/coder/workspace`,
      },
      201,
      "Container created successfully"
    );
  } catch (error) {
    return Response.error(
      null,
      500,
      "Failed to create container: " + (error as Error).message
    );
  }
}
