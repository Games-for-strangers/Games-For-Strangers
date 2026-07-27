import { GameCard } from "@/components/game-card";

const GAMES = [
  {
    title: "Where Is This?",
    description: "Race strangers to guess the country from a Street View image.",
    emoji: "🌍",
    href: "/play/where-is-this",
  },
  {
    title: "Coming Soon",
    description: "A new game is on its way.",
    emoji: "❓",
    comingSoon: true,
  },
  {
    title: "Coming Soon",
    description: "Something mysterious is being built.",
    emoji: "❓",
    comingSoon: true,
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col justify-center px-6">
      <div className="mb-12 mt-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Games for Strangers</h1>
        <p className="mt-2 text-muted-foreground">Pick a game. Play with strangers.</p>
      </div>

      <div className="flex flex-col gap-4">
        {GAMES.map((game) => (
          <GameCard key={game.title} {...game} />
        ))}
      </div>

      <footer className="mt-16 mb-8 text-center text-xs text-muted-foreground">
        No accounts. No tracking. Just play.
        <br />
        <a
          href="https://ko-fi.com/gamesforstrangers"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Support on Ko-fi
        </a>
      </footer>
    </main>
  );
}
