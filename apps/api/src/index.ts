import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import { PTY } from "./process";
import "./utils/env";
import { Expolrer } from "./explorer";

// Import Routers
import fileSystemRouter from "./routes/file-system";
import { readRoot } from "./utils/read-root";

const port = process.env.PORT || 5001;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app
  .use(bodyParser.json())
  .use(express.urlencoded({ extended: true }))
  .use(
    cors({
      origin: "*",
    })
  )
  .use(morgan("dev"));

const pty = new PTY();
const exp = new Expolrer({
  directory: process.env.PROCESS_HOME || process.cwd(),
  // excludes: ["node_modules", ".git", "dist"],
});

io.on("connection", async (socket) => {
  console.log("a user connected");

  socket.emit("terminal:data", pty.history);
  socket.emit(
    "explorer:data",
    JSON.stringify(await readRoot(process.env.PROCESS_HOME || process.cwd()))
  );

  socket.on("terminal:resize", (data) => {
    try {
      const { cols, rows } = JSON.parse(data);
      pty.ptyProcess.resize(cols, rows);
    } catch (error) {}
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

pty.ptyProcess.onData((data) => {
  io.emit("terminal:data", data);
});

exp.init((root) => {
  if (!root) return;
  console.log("Explorer:Data");

  io.emit("explorer:data", JSON.stringify(root));
});

// Routes
app.use("/api/files", fileSystemRouter);

app.post("/terminal", (req, res) => {
  const { data } = req.body;
  pty.ptyProcess.write(data);
  res.send("success");
});

// Start Server
server.listen(port, () => {
  console.log(`Listening on port : ${port}`);
});
