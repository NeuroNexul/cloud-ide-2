"use client";

import React, { createContext } from "react";
import { Data } from "./type";
import { useSocket } from "../socket";

export const dataContext = createContext<Data | null>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useSocket();

  const [root, setRoot] = React.useState<Data["explorer"]["root"]>({
    name: "root",
    type: "root",
    absolutePath: "/",
    nodes: [],
  });

  const [tabs, setTabs] = React.useState<Data["editor"]["tabs"]>([]);

  React.useEffect(() => {
    if (!socket) return;

    socket.on("explorer:data", (root) => {
      try {
        const data = JSON.parse(root);
        setRoot(data);
      } catch (error) {}
    });

    return () => {
      socket.off("explorer:data");
    };
  }, [socket]);

  return (
    <dataContext.Provider
      value={{
        explorer: {
          root,
        },
        editor: {
          tabs: tabs,
          setTabs: setTabs,
        },
      }}
    >
      {children}
    </dataContext.Provider>
  );
};

export function useData() {
  const context = React.useContext(dataContext);

  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }

  return context;
}
