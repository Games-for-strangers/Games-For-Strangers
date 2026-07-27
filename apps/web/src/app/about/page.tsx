import Link from "next/link";

export default function About() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col justify-center px-6">
      <div className="mb-12 mt-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">About</h1>
      </div>

      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Games for Strangers</strong> is a collection of tiny multiplayer
          games designed for the weird joy of playing with people you&apos;ve never met.
        </p>

        <p>
          No accounts. No passwords. No usernames. You show up as an animal with a
          splash of color, pick a game, and instantly play with strangers from around the world.
        </p>

        <p>
          We don&apos;t collect anything. No tracking. No cookies. Just the game.
        </p>

        <p>
          Powered by{" "}
          <a
            href="https://realfavicongenerator.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            RealFaviconGenerator
          </a>
          .
        </p>

        <div className="pt-2 text-center">
          <Link href="/" className="inline-block text-xs underline underline-offset-2 hover:text-foreground">
            Back to games
          </Link>
        </div>
      </div>
    </main>
  );
}
