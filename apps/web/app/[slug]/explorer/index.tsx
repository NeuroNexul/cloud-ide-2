"use client";

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
import { useData } from "~/context/data";
import { Directory, Root } from "~/context/data/type";

type Props = object;

export default function Explorer({}: Props) {
  const data = useData();

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
      <ScrollArea className="w-full h-[calc(100%-31px)]" orientation="vertical">
        <div className="w-full h-full flex-grow p-2">
          <DirectoryView node={data.explorer.root} />
        </div>
      </ScrollArea>
    </div>
  );
}

function DirectoryView({ node }: { node: Root | Directory }) {
  const data = useData();

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={node.type === "root" ? "item-1" : undefined}
    >
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
        {(node.type === "dir" || node.type === "root") &&
          node.nodes.length > 0 && (
            <AccordionContent className="border-none p-0">
              <div className="pl-4 border-l">
                <div>
                  {node.nodes
                    .sort((a, b) => (b.type === "dir" ? 1 : -1))
                    .map((child) => {
                      if (child.type === "file") {
                        return (
                          <div
                            key={child.absolutePath}
                            className={cn(
                              "hover:bg-muted/50 border border-background rounded-md py-2 px-4 font-semibold cursor-pointer flex flex-row items-center gap-2 text-ellipsis overflow-hidden whitespace-nowrap",
                              data.editor.tabs.find(
                                (tab) =>
                                  tab.absolutePath === child.absolutePath &&
                                  tab.isActive
                              )
                                ? "bg-muted/40"
                                : ""
                            )}
                            onClick={() => {
                              data.editor.setTabs((tabs) => {
                                if (
                                  tabs.find(
                                    (tab) =>
                                      tab.absolutePath === child.absolutePath
                                  )
                                ) {
                                  return tabs.map(
                                    (tab) =>
                                      ({
                                        ...tab,
                                        isActive:
                                          tab.absolutePath ===
                                          child.absolutePath,
                                      }) as any
                                  );
                                }

                                return [
                                  ...(tabs.map((tab) => ({
                                    ...tab,
                                    isActive: false,
                                  })) as any),
                                  {
                                    ...child,
                                    isActive: true,
                                    data: "",
                                  },
                                ];
                              });
                            }}
                          >
                            {/* <FaRegFile className="flex-shrink-0" /> */}
                            <Image
                              src={getIcon(child.name)}
                              alt={child.name}
                              width={18}
                              height={18}
                              className="flex-shrink-0"
                            />
                            {child.name}
                          </div>
                        );
                      } else {
                        return <DirectoryView key={child.name} node={child} />;
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
