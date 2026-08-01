import type { Context } from "hono";
import { Hono } from "hono";
import prisma from "@gamesforstrangers/db";
import { createRateLimiter } from "../rate-limit";
import { verifyTurnstileToken } from "../turnstile";

const rateLimit = createRateLimiter(30, 60_000);

async function getDailyScores(c: Context) {
  const cfToken = c.req.header("x-turnstile-token");
  if (cfToken && !(await verifyTurnstileToken(cfToken))) {
    return c.json({ error: "Turnstile verification failed" }, 403);
  }
  const slug = c.req.query("game");
  if (!slug) return c.json({ error: "Missing game slug" }, 400);

  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game) return c.json({ error: "Unknown game slug" }, 404);

  const limit = Math.min(Math.max(parseInt(c.req.query("limit") ?? "10", 10) || 10, 1), 25);
  const offset = Math.max(parseInt(c.req.query("offset") ?? "0", 10) || 0, 0);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [topScores, total] = await Promise.all([
    prisma.dailyScore.findMany({
      where: { gameId: game.id, date: today },
      orderBy: { score: "desc" },
      skip: offset,
      take: limit,
      select: { playerId: true, username: true, score: true },
    }),
    prisma.dailyScore.count({
      where: { gameId: game.id, date: today },
    }),
  ]);

  return c.json({ scores: topScores, total, limit, offset });
}

const scores = new Hono();

scores.get("/daily", rateLimit, getDailyScores);

export default scores;
export { getDailyScores, rateLimit };
