// import { OneOf } from "@/types/utils";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";

import { FaRegFolderClosed, FaRegFolderOpen } from "react-icons/fa6";
import { BsFolderPlus } from "react-icons/bs";
import { cn } from "@repo/ui/lib/utils";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import Image from "next/image";
import { getIcon } from "~/components/flie_icons/icons";
import { Button } from "@repo/ui/components/ui/button";
import { VscNewFile } from "react-icons/vsc";
import { IoReloadOutline } from "react-icons/io5";

type File = {
  name: string;
  type: "file";
  extension: string;
};

type Dir = {
  name: string;
  type: "dir";
  children: Array<File | Dir>;
};

// type Node = OneOf<[File, Dir]>;

const rootDir: Dir = {
  name: "root",
  type: "dir",
  children: [
    {
      name: "home",
      type: "dir",
      children: [
        {
          name: ".next",
          type: "dir",
          children: [],
        },
        {
          name: "app",
          type: "dir",
          children: [
            {
              name: "index.tsx",
              type: "file",
              extension: "tsx",
            },
            {
              name: "terminal",
              type: "dir",
              children: [
                {
                  name: "index.tsx",
                  type: "file",
                  extension: "tsx",
                },
              ],
            },
            {
              name: "explorer",
              type: "dir",
              children: [
                {
                  name: "index.tsx",
                  type: "file",
                  extension: "tsx",
                },
              ],
            },
          ],
        },
        {
          name: "public",
          type: "dir",
          children: [
            {
              name: "favicon.ico",
              type: "file",
              extension: "ico",
            },
            {
              name: "logo.svg",
              type: "file",
              extension: "svg",
            },
          ],
        },
      ],
    },
  ],
};

type Props = object;

export default function Explorer({}: Props) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Bar */}
      <div className="w-full h-8 bg-muted/60 flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground overflow-hidden whitespace-nowrap text-ellipsis">
          EXPLORER: CLOUD_IDE
        </p>

        {/* Actions */}
        <div className="flex flex-shrink-0 space-x-2 px-2">
          <Button className="bg-transparent hover:bg-background/50 p-1 h-auto text-foreground">
            <BsFolderPlus />
          </Button>
          <Button className="bg-transparent hover:bg-background/50 p-1 h-auto text-foreground">
            <VscNewFile />
          </Button>
          <Button className="bg-transparent hover:bg-background/50 p-1 h-auto text-foreground">
            <IoReloadOutline />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full h-full flex-grow p-2">
        <ScrollArea className="w-full h-full" orientation="vertical">
          <Directory node={rootDir} />
        </ScrollArea>
      </div>
    </div>
  );
}

function Directory({ node }: { node: Dir }) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger
          className={cn(
            "hover:bg-muted/50 hover:no-underline border border-background rounded-md py-2 px-4 flex flex-row items-center gap-2",
            "[&>.closed]:data-[state=open]:hidden [&>.open]:data-[state=open]:block",
            "[&>.closed]:data-[state=closed]:block [&>.open]:data-[state=closed]:hidden",
            "data-[state=open]:bg-muted/40"
          )}
        >
          <FaRegFolderClosed className="closed flex-shrink-0" size={16} />
          <FaRegFolderOpen className="open !rotate-0 flex-shrink-0" size={16} />
          <p className="w-full flex-grow text-left text-ellipsis overflow-hidden whitespace-nowrap">
            {node.name}
          </p>
        </AccordionTrigger>
        {node.children.length > 0 && (
          <AccordionContent className="border-none p-0">
            <div className="pl-4 border-l">
              <div>
                {node.children
                  .sort((a, b) => (b.type === "dir" ? 1 : -1))
                  .map((child) => {
                    if (child.type === "file") {
                      return (
                        <div
                          key={child.name}
                          className="hover:bg-muted/50 border border-background rounded-md py-2 px-4 font-semibold cursor-pointer flex flex-row items-center gap-2 text-ellipsis overflow-hidden whitespace-nowrap"
                        >
                          {/* <FaRegFile className="flex-shrink-0" /> */}
                          <Image
                            src={getIcon(child.name)}
                            alt={child.name}
                            width={25}
                            height={25}
                            className="px-1 flex-shrink-0"
                          />
                          {child.name}
                        </div>
                      );
                    } else {
                      return <Directory key={child.name} node={child} />;
                    }
                  })}
              </div>
            </div>
          </AccordionContent>
        )}
      </AccordionItem>
    </Accordion>
  );
}
