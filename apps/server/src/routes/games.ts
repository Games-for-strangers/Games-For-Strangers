import type { Context } from "hono";
import { Hono } from "hono";
import prisma from "@gamesforstrangers/db";
import { gameState } from "../state";
import { createRateLimiter } from "../rate-limit";

const rateLimit = createRateLimiter(30, 60_000);

const games = new Hono();

games.get("/", rateLimit, async (c: Context) => {
  const dbGames = await prisma.game.findMany({
    select: { slug: true, title: true },
  });

  const playerCounts = gameState.getAllGameCounts();

  const result = dbGames.map((g) => ({
    slug: g.slug,
    title: g.title,
    activePlayers: playerCounts.find((p) => p.slug === g.slug)?.players ?? 0,
  }));

  return c.json(result);
});

games.get("/:slug", rateLimit, async (c: Context) => {
  const { slug } = c.req.param();
  const game = await prisma.game.findUnique({
    where: { slug },
    select: { slug: true, title: true },
  });

  if (!game) return c.json({ error: "Game not found" }, 404);

  return c.json({
    slug: game.slug,
    title: game.title,
    activePlayers: gameState.getPlayerCount(slug),
  });
});

export default games;
