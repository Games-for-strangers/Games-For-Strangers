import { createServer } from "node:http";
import { env } from "@gamesforstrangers/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createSocketServer } from "./socket/handler";
import gamesRoutes from "./routes/games";
import scoresRoutes, { getDailyScores, rateLimit as scoresRateLimit } from "./routes/scores";

const app = new Hono();

app.use(logger());
const corsMw = cors({
  origin: env.CORS_ORIGIN,
  allowMethods: ["GET", "POST", "OPTIONS"],
});
app.use("/api/*", corsMw);
app.use("/daily", corsMw);

app.get("/", (c) => c.text("OK"));

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.route("/api/games", gamesRoutes);
app.route("/api/scores", scoresRoutes);
app.get("/daily", scoresRateLimit, getDailyScores);

// Hono and Socket.IO both listen on the same server.  Socket.IO handles its
// own transport paths (/socket.io/*) via an internal engine.io listener; our
// Hono handler must NOT touch those or it'll return a 404 before engine.io
// gets to respond.
//
// Bun detects when a createServer callback returns a Response (or a Promise
// resolving to one) and sends it automatically.  Without the `return`, Bun
// never sends anything, Coolify's health check times out, and the container
// gets stuck in a restart loop.
const httpServer = createServer((req, res) => {
  if (req.url?.startsWith("/socket.io")) return;
  return app.fetch(req, res).catch((err) => {
    console.error("Request handler error:", err);
    return new Response("Internal Server Error", { status: 500 });
  });
});
createSocketServer(httpServer);

const port = parseInt(env.SERVER_PORT || "3002");
httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
