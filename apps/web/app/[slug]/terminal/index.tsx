"use client";

import React, { useEffect, useRef } from "react";
import { Terminal as Term } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useSocket } from "~/context/socket";

type Props = {};

export default function Terminal({}: Props) {
  const socket = useSocket();
  const TElement = useRef<HTMLDivElement>(null);
  const XTerm = useRef<Term>();

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
      socket.emit("terminal:resize", JSON.stringify(fitAddon.proposeDimensions())); // Initial resize

      XTerm.current.open(TElement.current);

      XTerm.current.onKey(async (e) => {
        if (!XTerm.current) return;

        await fetch("http://localhost:5001/terminal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: e.key }),
        });
      });

      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
        socket.emit("terminal:resize", JSON.stringify(fitAddon.proposeDimensions()));
      });
      resizeObserver.observe(TElement.current);

      return () => {
        resizeObserver.disconnect();
        XTerm.current?.dispose();
        XTerm.current = undefined;
      };
    }
  }, [TElement, XTerm]);

  useEffect(() => {
    const onSocketData = (data: any) => {
      XTerm.current?.write(data);
    };

    socket.listeners("terminal:data").length === 0 &&
      socket.on("terminal:data", onSocketData);

    return () => {
      socket.off("terminal:data", onSocketData);
    };
  }, []);

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
