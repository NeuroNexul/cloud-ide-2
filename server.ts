import { createServer, Server } from "http";
import { createProxyServer } from "http-proxy";
import { parse } from "url";
import next from "next";

const CODE_SERVER_PORT = 8080;
const PORT = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, turbopack: true });
const handle = app.getRequestHandler();
// const upgrade = app.getUpgradeHandler();

const proxy = createProxyServer({ changeOrigin: true });
let server: Server;

await app.prepare().then(() => {
  server = createServer((req, res) => {
    try {
      // Extract the subdomain from the request URL
      const subdomain = req?.headers?.host?.split(".")[0];

      if (subdomain === `localhost:${PORT}`) {
        handle(req, res);
        return;
      }

      // Modify the request hostname to target the CodeServer running on the extracted port
      req.headers.host = `localhost:${CODE_SERVER_PORT}`;

      // Proxy the request to the CodeServer
      proxy.web(
        req,
        res,
        { target: `http://localhost:${CODE_SERVER_PORT}` },
        (err) => {
          console.error("Proxy Error:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Proxy Error");
        }
      );
    } catch (err) {
      console.error("Error occurred handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // Handle WebSocket connections
  server.on("upgrade", (req, socket, head) => {
    try {
      // Extract the subdomain from the request URL
      const subdomain = req?.headers?.host?.split(".")[0];

      if (subdomain === `localhost:${PORT}` || !subdomain) {
        // upgrade(req, socket, head);
        app.getUpgradeHandler()(req, socket, head);
        return;
      }

      // Extract the port number from the subdomain
      const port = parseInt(subdomain.split("-")[1]) || CODE_SERVER_PORT;

      // Proxy WebSocket requests to the CodeServer
      proxy.ws(
        req,
        socket,
        head,
        { target: `ws://localhost:${port}` },
        (err) => {
          console.error("Proxy Error:", err);
          socket.destroy();
        }
      );
    } catch (error) {
      console.error("Error:", error);
      socket.destroy();
    }
  });

  server.listen(PORT, () => {
    console.log(
      `> Server listening at http://localhost:${PORT} as ${
        dev ? "development" : process.env.NODE_ENV
      }`
    );
  });
});
