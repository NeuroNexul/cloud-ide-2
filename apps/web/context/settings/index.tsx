"use client";

import { EditorProps } from "@monaco-editor/react";
import React, { createContext, useState } from "react";
import { IAppearence } from "./types";

type SettingsContextType = {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  appearance: IAppearence;
  setAppearance: React.Dispatch<React.SetStateAction<IAppearence>>;
  editor: EditorProps["options"];
  setEditor: React.Dispatch<React.SetStateAction<EditorProps["options"]>>;
};

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

type Props = {
  children: React.ReactNode;
};

export const SettingsProvider: React.FC<Props> = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [editor, setEditor] = useState<EditorProps["options"]>({
    minimap: { enabled: false },
    automaticLayout: true,
    theme: "default",
    renderWhitespace: "all",
    stickyScroll: { enabled: true },
    renderControlCharacters: true,
  });
  const [appearance, setAppearance] = useState<IAppearence>({
    navBar: { enabled: true },
    primarySideBar: { enabled: true, position: "left" },
  });

  return (
    <SettingsContext.Provider
      value={{ theme, setTheme, editor, setEditor, appearance, setAppearance }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
