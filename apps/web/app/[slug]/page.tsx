"use client";

import React from "react";
import NavBar from "./nav";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/ui/components/ui/resizable";
import { cn } from "@repo/ui/lib/utils";
import Terminal from "./terminal";
import Explorer from "./explorer";
import Editor from "./editor";
import ActivityBar from "./activity_bar";
import { useSettings } from "~/context/settings";

type Props = object;

export default function Page({}: Props) {
  const settings = useSettings();

  return (
    <div className="w-full h-full relative flex flex-col">
      <NavBar className="border-b border-background" />

      <div className="w-full h-[calc(100%-47px)] flex-grow flex flex-row px-1 bg-muted">
        <ActivityBar />
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={"resizable-panel-group-1"}
          className="flex-grow w-full"
        >
          <ResizablePanel>
            <div className="w-full h-full bg-muted px-[2px] py-1">
              <div className="w-full h-full bg-background rounded-lg overflow-hidden">
                <Explorer />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle
            className={cn(
              "data-[resize-handle-state=hover]:bg-blue-400",
              "data-[resize-handle-state=drag]:bg-blue-400",
              "transition-colors"
            )}
          />
          <ResizablePanel>
            <ResizablePanelGroup
              direction="horizontal"
              autoSaveId={"resizable-panel-group-2"}
            >
              <ResizablePanel>
                <div className="w-full h-full bg-muted px-[2px] py-1">
                  <div className="w-full h-full bg-background rounded-lg overflow-hidden">
                    <Editor />
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle
                className={cn(
                  "data-[resize-handle-state=hover]:bg-blue-400",
                  "data-[resize-handle-state=drag]:bg-blue-400",
                  "transition-colors"
                )}
              />
              <ResizablePanel>
                <div className="w-full h-full bg-muted px-[2px] py-1">
                  <div className="w-full h-full bg-background rounded-lg overflow-hidden">
                    <Terminal />
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
