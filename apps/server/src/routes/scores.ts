import type { Context } from "hono";
import { Hono } from "hono";
import prisma from "@gamesforstrangers/db";
import { createRateLimiter } from "../rate-limit";

const rateLimit = createRateLimiter(30, 60_000);

const scores = new Hono();

scores.get("/daily", rateLimit, async (c: Context) => {
  const game = c.req.query("game");
  if (!game) return c.json({ error: "Missing game slug" }, 400);

  const limit = Math.min(Math.max(parseInt(c.req.query("limit") ?? "10", 10) || 10, 1), 25);
  const offset = Math.max(parseInt(c.req.query("offset") ?? "0", 10) || 0, 0);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [topScores, total] = await Promise.all([
    prisma.dailyScore.findMany({
      where: { gameId: game, date: today },
      orderBy: { score: "desc" },
      skip: offset,
      take: limit,
      select: { playerId: true, username: true, score: true },
    }),
    prisma.dailyScore.count({
      where: { gameId: game, date: today },
    }),
  ]);

  return c.json({ scores: topScores, total, limit, offset });
});

export default scores;
