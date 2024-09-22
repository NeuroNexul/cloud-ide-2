"use client";

import React, { useEffect, useMemo, useState } from "react";
import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { Button } from "@repo/ui/components/ui/button";
import { FaPlay } from "react-icons/fa6";
import { IoIosClose, IoIosColorWand } from "react-icons/io";
import { cn } from "@repo/ui/lib/utils";
import { defineTheme } from "./my-theme";
import Image from "next/image";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { getIcon } from "~/components/flie_icons/icons";
import { useSettings } from "~/context/settings";
import { useData } from "~/context/data";

type Props = object;

export default function Editor({}: Props) {
  const monaco = useMonaco();
  const settings = useSettings();
  const data = useData();

  const files = useMemo<
    {
      name: string;
      path: string;
      value: string | null;
    }[]
  >(() => {
    const tabs = data.editor.tabs;
    return tabs.map((tab) => ({
      name: tab.name,
      path: tab.absolutePath,
      value: null,
    }));
  }, [data]);

  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<{
    name: string;
    path: string;
    value: string | null;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (!fileName) return;

      const file = files.find((f) => f.path === fileName);
      if (!file) return;

      if (file.value === null) {
        const res = await fetch(
          `http://localhost:5001/api/files/get?path=${file.path}`
        );
        const data = await res.json();
        file.value = data.content;
      }

      setFile(file);
    })();
  }, [fileName]);

  useEffect(() => {
    if (!data) return;

    setFileName(
      data.editor.tabs.find((tab) => tab.isActive)?.absolutePath || ""
    );
  }, [data]);

  useEffect(() => {
    if (!monaco) return;

    defineTheme(monaco);
    monaco.editor.setTheme("default");

    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
    });
  }, [monaco]);

  return (
    <div className="w-full h-full">
      {/* Navbar */}
      <div className="w-full h-8 bg-muted/60 flex items-center justify-between">
        {/* Tabs */}
        <ScrollArea
          className="h-full w-full"
          orientation="horizontal"
          width={6}
        >
          <div className="flex h-full w-full">
            {files.map((file) => (
              <div
                key={file.path}
                className={cn(
                  "border-y-2 border-y-transparent rounded-t-lg overflow-hidden transition-colors hover:bg-muted",
                  "border-x",
                  "flex items-center justify-center flex-shrink-0",
                  "group",
                  file.path === fileName
                    ? "bg-background border-t-blue-700"
                    : ""
                )}
              >
                <button
                  className={cn(
                    "px-1 py-1 h-full hover:bg-muted transition-colors text-sm flex flex-row items-center flex-shrink-0"
                  )}
                  onClick={() => {
                    data.editor.setTabs((tabs) =>
                      tabs.map((tab) => ({
                        ...tab,
                        isActive: tab.absolutePath === file.path,
                      }))
                    );
                    setFileName(file.path);
                  }}
                  disabled={file.path === fileName}
                >
                  <Image
                    src={getIcon(file.name)}
                    alt={file.path}
                    width={25}
                    height={25}
                    className="px-1 flex-shrink-0"
                  />
                  {file.name}
                </button>
                <button
                  className={cn(
                    "group-hover:opacity-100 opacity-0 transition-opacity flex-shrink-0",
                    "px-1 py-1 h-full hover:bg-background transition-colors",
                    file.path === fileName ? "opacity-100" : ""
                  )}
                  onClick={() => {
                    data.editor.setTabs((tabs) =>
                      tabs.filter((tab) => tab.absolutePath !== file.path)
                    );
                  }}
                >
                  <IoIosClose />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex flex-shrink-0 space-x-2 px-2">
          <Button className="bg-transparent hover:bg-background/50 p-1 h-auto text-foreground">
            <FaPlay />
          </Button>
          <Button className="bg-transparent hover:bg-background/50 p-1 h-auto text-foreground">
            <IoIosColorWand />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="w-full h-[calc(100%-2rem)]">
        {file ? (
          <MonacoEditor
            height="100%"
            theme="default"
            path={file.path}
            // defaultLanguage={file.language}
            defaultValue={file.value === null ? "Loading..." : file.value}
            onChange={(value) => {
              fetch("http://localhost:5001/api/files/update", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  path: file.path,
                  content: value,
                }),
              });
            }}
            options={{
              readOnly: file.value === null,
              padding: { top: 8 },
              "semanticHighlighting.enabled": false,
              ...settings.editor,
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground">
            No file selected
          </div>
        )}
      </div>
    </div>
  );
}
