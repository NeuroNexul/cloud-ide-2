import { DEFAULT_FILE, getIconForFile } from "vscode-icons-js";

export function getIcon(name: string) {
  const base = "https://vscode-icons.github.io/vscode-icons/icons/";
  return `${base}${getIconForFile(name) || DEFAULT_FILE}`;
}
