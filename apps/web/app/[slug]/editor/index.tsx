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

type File = {
  name: string;
  language: string;
  value: string;
};

const files: File[] = [
  {
    name: "script.js",
    language: "javascript",
    value: `console.log("Hello, world!");`,
  },
  {
    name: "style.css",
    language: "css",
    value: `body {
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;
}`,
  },
  {
    name: "index.html",
    language: "html",
    value: `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <script src="script.js"></script>
  </body>
</html>`,
  },
];

type Props = object;

export default function Editor({}: Props) {
  const monaco = useMonaco();
  const settings = useSettings();

  const [fileName, setFileName] = useState("index.html");
  const file = useMemo(
    () => files.find((f) => f.name === fileName) || files[0],
    [fileName]
  );

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
        <ScrollArea className="h-full w-full" orientation="horizontal">
          <div className="flex h-full w-full">
            {files.map((file) => (
              <div
                key={file.name}
                className={cn(
                  "border-y-2 border-y-transparent rounded-t-lg overflow-hidden transition-colors hover:bg-muted",
                  "border-x",
                  "flex items-center justify-center",
                  "group",
                  file.name === fileName
                    ? "bg-background border-t-blue-700"
                    : ""
                )}
              >
                <button
                  className={cn(
                    "px-1 py-1 h-full hover:bg-muted transition-colors text-sm flex flex-row items-center"
                  )}
                  onClick={() => setFileName(file.name)}
                  disabled={file.name === fileName}
                >
                  <Image
                    src={getIcon(file.name)}
                    alt={file.name}
                    width={25}
                    height={25}
                    className="px-1 flex-shrink-0"
                  />
                  {file.name}
                </button>
                <button
                  className={cn(
                    "group-hover:opacity-100 opacity-0 transition-opacity",
                    "px-1 py-1 h-full hover:bg-background transition-colors",
                    file.name === fileName ? "opacity-100" : ""
                  )}
                  onClick={() => {
                    // setFileName(files[0].name);
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
            path={file.name}
            defaultLanguage={file.language}
            defaultValue={file.value}
            options={{
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
