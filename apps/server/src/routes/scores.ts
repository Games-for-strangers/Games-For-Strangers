import type { Context } from "hono";
import { Hono } from "hono";
import prisma from "@gamesforstrangers/db";
import { createRateLimiter } from "../rate-limit";

const rateLimit = createRateLimiter(30, 60_000);

const scores = new Hono();

scores.get("/daily", rateLimit, async (c: Context) => {
  const game = c.req.query("game");
  if (!game) return c.json({ error: "Missing game slug" }, 400);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const topScores = await prisma.dailyScore.findMany({
    where: { gameId: game, date: today },
    orderBy: { score: "desc" },
    take: 10,
    select: { playerId: true, score: true },
  });

  return c.json(topScores);
});

export default scores;
