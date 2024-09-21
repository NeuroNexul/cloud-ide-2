import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";

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

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.listen(port, () => {
  console.log(`Listening on port : ${port}`);
});
