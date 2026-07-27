import type { Context, Next } from "hono";

interface Bucket {
  tokens: number;
  lastRefill: number;
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now - bucket.lastRefill > windowMs * 2) {
        buckets.delete(key);
      }
    }
  }, windowMs * 10);

  if (typeof cleanup.unref === "function") {
    cleanup.unref();
  }

  return async function rateLimit(c: Context, next: Next) {
    const ip = c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip") ?? "unknown";
    const now = Date.now();
    let bucket = buckets.get(ip);

    if (!bucket || now - bucket.lastRefill >= windowMs) {
      bucket = { tokens: maxRequests, lastRefill: now };
      buckets.set(ip, bucket);
    }

    if (bucket.tokens <= 0) {
      return c.json({ error: "Too many requests" }, 429);
    }

    bucket.tokens--;
    await next();
  };
}
