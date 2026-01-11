import { createServer } from "http";
import { createProxyServer } from "http-proxy";
import next from "next";

const PORT = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, turbopack: true });
const handle = app.getRequestHandler();
const proxy = createProxyServer({});

await app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      // Extract the subdomain from the request URL
      const subdomain = req?.headers?.host?.split(".")[0];

      if (subdomain === `localhost:${PORT}` || !subdomain) {
        handle(req, res);
        return;
      }

      // Extract the port number from the subdomain
      const CODE_SERVER_PORT = parseInt(subdomain.split("-")[1]) || PORT;
      const target = `http://localhost:${CODE_SERVER_PORT}`;

      // Modify the request hostname to target the CodeServer running on the extracted port
      req.headers.host = `localhost:${CODE_SERVER_PORT}`;

      // Proxy the request to the CodeServer
      proxy.web(req, res, { target }, (err) => {
        console.error("Proxy Error:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy Error");
      });
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
      const CODE_SERVER_PORT = parseInt(subdomain.split("-")[1]) || PORT;
      const target = `ws://localhost:${CODE_SERVER_PORT}`;

      console.log(
        `\n==========================================\nProxying WebSocket to: ${target}\n - subdomain: ${subdomain}\n - path: ${req.url}\n==========================================`
      );

      // Proxy WebSocket requests to the CodeServer
      // changeOrigin: true automatically adjusts host/origin headers to match target
      proxy.ws(req, socket, head, { target, ws: true });
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
