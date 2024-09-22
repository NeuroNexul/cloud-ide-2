import { watch } from "chokidar";
import { Root } from "../types/files";
import { readRoot } from "../utils/read-root";

type Options = {
  directory: string;
  includes?: string[];
  excludes?: string[];
};

export class Expolrer {
  directory: string;
  includes: string[] | undefined;
  excludes: string[] | undefined;

  constructor(options: Options) {
    this.directory = options.directory;
    this.includes = options.includes;
    this.excludes = options.excludes;

    this.init();
  }

  async init(onChange?: (root: Root) => void) {
    try {
      const watcher = watch(this.directory, {
        persistent: true,
        ignored: (path) => {
          if (/(^|[\/\\])\../.test(path)) {
            return true;
          }

          if (this.excludes && this.excludes.length) {
            return this.excludes.some((exclude) => path.includes(exclude));
          }

          return false;
        },
        // ignored: /(^|[\/\\])\../,
      });

      watcher.on("all", async (event, path) => {
        const root = await readRoot(this.directory);
        if (onChange && typeof onChange === "function") {
          onChange(root);
        }
      });

      const root = await readRoot(this.directory);
      if (onChange && typeof onChange === "function") {
        onChange(root);
      }
    } catch (error) {}
  }
}
