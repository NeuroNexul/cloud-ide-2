import os from "os";
import pty from "node-pty";

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

export const ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env,
});

