import { createServer } from "node:http";
import { env } from "@gamesforstrangers/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createSocketServer } from "./socket/handler";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

const httpServer = createServer(app.fetch);
createSocketServer(httpServer);

const port = parseInt(env.SERVER_PORT || "3002");
httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
