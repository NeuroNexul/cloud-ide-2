import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import { PTY } from "./process";

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

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.emit("terminal:data", pty.history);

  socket.on("terminal:resize", (data) => {
    const { cols, rows } = JSON.parse(data);
    pty.ptyProcess.resize(cols, rows);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

pty.ptyProcess.onData((data) => {
  io.emit("terminal:data", data);
});

app.post("/terminal", (req, res) => {
  const { data } = req.body;
  pty.ptyProcess.write(data);
  res.send("success");
});

server.listen(port, () => {
  console.log(`Listening on port : ${port}`);
});
