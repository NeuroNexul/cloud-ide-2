import os from "os";
import * as nodepty from "node-pty";

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

export class PTY {
  ptyProcess: nodepty.IPty;
  history: string = "";

  constructor() {
    this.ptyProcess = nodepty.spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env,
    });

    this.ptyProcess.onData((data) => {
      this.history += data;
    });
  }
}
