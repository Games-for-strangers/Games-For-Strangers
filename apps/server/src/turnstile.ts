import { env } from "@gamesforstrangers/env/server";

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${env.TURNSTILE_SECRET_KEY}&response=${token}`,
    });

    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}
