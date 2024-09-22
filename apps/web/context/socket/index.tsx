"use client";

import { createContext, useContext, useMemo } from "react";
import io, { type Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

// const socket = io("ws://localhost:5001");

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useMemo(() => io("ws://localhost:5001"), []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export function useSocket(): Socket {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
}
