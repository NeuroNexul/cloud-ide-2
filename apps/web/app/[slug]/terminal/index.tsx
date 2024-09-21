"use client";

import React, { useEffect, useRef } from "react";
import { Terminal as Term } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

type Props = object;

export default function Terminal({}: Props) {
  const TElement = useRef<HTMLDivElement>(null);
  const XTerm = useRef<Term>();

  function handleCommand(input: string) {
    if (!XTerm.current) return;

    if (input === "") {
      XTerm.current.writeln("");
      XTerm.current.write("\x1B[1;32muser@User\x1B[0m:\x1B[1;34m/cloud-ide\x1B[0m$ ");
      return;
    }

    const args = input.split(" ");
    const command = args[0];
    const params = args.slice(1).join(" ");
    switch (command) {
      case "echo":
        XTerm.current.writeln("");
        XTerm.current.writeln(params);
        XTerm.current.write("\x1B[1;32muser@User\x1B[0m:\x1B[1;34m/cloud-ide\x1B[0m$ ");
        break;
      case "cat":
        // Implement 'cat' command logic here
        break;
      default:
        XTerm.current.writeln("");
        XTerm.current.writeln("");
        XTerm.current.writeln(`Command not found: ${command}`);
        XTerm.current.write("\x1B[1;32muser@User\x1B[0m:\x1B[1;34m/cloud-ide\x1B[0m$ ");
    }
  }

  useEffect(() => {
    if (XTerm.current) {
      XTerm.current.dispose();
    }

    if (TElement.current) {
      XTerm.current = new Term({
        cursorBlink: true,
        fontSize: 14,
        lineHeight: 1.5,
        fontFamily: "var(--font-jetbrains-mono)",
        theme: {
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          cursor: "#abb2bf",
          black: "#282c34",
          red: "#e06c75",
          green: "#98c379",
          yellow: "#e5c07b",
          blue: "#61afef",
          magenta: "#c678dd",
          cyan: "#56b6c2",
          white: "#abb2bf",
          brightBlack: "#5c6370",
          brightRed: "#e06c75",
          brightGreen: "#98c379",
          brightYellow: "#e5c07b",
          brightBlue: "#61afef",
          brightMagenta: "#c678dd",
          brightCyan: "#56b6c2",
          brightWhite: "#abb2bf",
          selectionBackground: "#3e445177",
        },
      });

      // Addons
      const fitAddon = new FitAddon();
      XTerm.current.loadAddon(fitAddon);
      fitAddon.fit();

      XTerm.current.open(TElement.current);
      XTerm.current.write("\x1B[1;32muser@User\x1B[0m:\x1B[1;34m/cloud-ide\x1B[0m$ ");

      // XTerm.current.onData((data) => {
      //   XTerm.current?.write(data);
      // });

      let command = "";
      XTerm.current.onData((e) => {
        if (!XTerm.current) return;

        if (e === "\r") {
          // Enter key
          handleCommand(command.trim());
          command = ""; // Reset command buffer
        } else if (e === "\x7F") {
          // Backspace key
          if (command.length > 0) {
            XTerm.current.write("\b \b"); // Move cursor back, erase character, move cursor back again
            command = command.slice(0, -1); // Remove last character from command buffer
          }
        } else if (e === "\x0C") {
          // Ctrl+L
          XTerm.current.clear();
        } else {
          XTerm.current.write(e); // Echo the typed character
          command += e; // Add typed character to command buffer
        }
      });

      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      resizeObserver.observe(TElement.current);

      return () => {
        resizeObserver.disconnect();
        XTerm.current?.dispose();
      };
    }
  }, [TElement, XTerm]);

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="w-full h-8 flex items-center justify-center bg-muted/60 text-white">
        Terminal
      </div>

      <div className="w-full h-[calc(100%-2rem)] flex-grow relative">
        {/* <ScrollArea orientation="vertical" className="h-full"> */}
        <div className="w-full h-full pt-2 pb-1 px-2">
          <div ref={TElement} className="w-full h-full" />
        </div>
        {/* </ScrollArea> */}
      </div>
    </div>
  );
}
