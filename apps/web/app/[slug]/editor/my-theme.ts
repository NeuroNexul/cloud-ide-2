import { Monaco } from "@monaco-editor/react";

export function defineTheme(monaco: Monaco) {
  monaco.editor.defineTheme("default", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#020817",
      "editor.lineHighlightBackground": "#00000000",
      "editor.lineHighlightBorder": "#00000000",
    },
  });
}
