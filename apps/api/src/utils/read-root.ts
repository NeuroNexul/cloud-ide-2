import * as FSExtra from "fs-extra";
import * as path from "path";
import { Directory, File, Root } from "../types/files";

export async function readRoot(directory: string): Promise<Root> {
  try {
    const stats = await FSExtra.stat(directory);
    if (stats.isDirectory()) {
      // console.time("Read-Root-Directory");
      const nodes = await FSExtra.readdir(directory);
      const root: Root = {
        name: `ROOT(${path.basename(directory)})`,
        type: "root",
        absolutePath: directory,
        nodes: [],
      };
      for (const node of nodes) {
        const nodePath = `${directory}/${node}`;
        const nodeStats = await FSExtra.stat(nodePath);
        if (nodeStats.isDirectory()) {
          root.nodes.push(readDir(nodePath));
        } else {
          const ext = path.extname(node);
          const file: File = {
            name: node,
            type: "file",
            absolutePath: nodePath,
            extension: ext || "",
          };
          root.nodes.push(file);
        }
      }
      // console.timeEnd("Read-Root-Directory");
      return root;
    } else {
      return {
        name: directory,
        type: "root",
        absolutePath: directory,
        nodes: [],
      };
    }
  } catch (error: any) {
    console.log(error);
    return {
      name: directory,
      type: "root",
      absolutePath: directory,
      nodes: [],
    };
  }
}

function readDir(directory: string): Directory {
  const dir: Directory = {
    name: path.basename(directory),
    type: "dir",
    absolutePath: directory,
    nodes: [],
  };

  // read the directory
  const nodes = FSExtra.readdirSync(directory);

  // loop through the nodes
  for (const node of nodes) {
    const nodePath = path.join(directory, node);
    const stats = FSExtra.statSync(nodePath);

    if (stats.isDirectory()) {
      const directory = readDir(nodePath);
      dir.nodes.push(directory);
    } else {
      const ext = path.extname(node);
      const file: File = {
        name: node,
        type: "file",
        absolutePath: nodePath,
        extension: ext,
      };
      dir.nodes.push(file);
    }
  }

  return dir;
}
