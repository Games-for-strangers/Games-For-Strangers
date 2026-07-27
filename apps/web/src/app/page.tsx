"use client";

import { Globe, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import { useEffect, useState } from "react";
import { useAnonymousIdentity } from "@gamesforstrangers/ui/hooks/use-anonymous-identity";
import { usePlayerIdentity } from "@gamesforstrangers/ui/hooks/use-player-identity";
import { AvatarPicker } from "@/components/avatar-picker";
import { GameCard } from "@/components/game-card";
import { IdentityDisplay } from "@/components/identity-display";
import { UsernameDialog } from "@/components/username-dialog";

const GAMES = [
  {
    title: "Where Is This?",
    description: "Race strangers to guess the country from a Street View image.",
    icon: Globe,
    href: "/play/where-is-this",
  },
  {
    title: "Coming Soon",
    description: "A new game is on its way.",
    icon: HelpCircle,
    comingSoon: true,
  },
  {
    title: "Coming Soon",
    description: "Something mysterious is being built.",
    icon: HelpCircle,
    comingSoon: true,
  },
] as const;

export default function Home() {
  const { identity: animalIdentity, setAnimal, setIdentity, allAnimals, allColors } = useAnonymousIdentity();
  const { identity: playerIdentity, setUsername, generateAndSetUsername } = usePlayerIdentity();
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchCounts() {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002";
        const res = await fetch(`${serverUrl}/api/games`);
        if (res.ok) {
          const games: { slug: string; activePlayers: number }[] = await res.json();
          const counts: Record<string, number> = {};
          for (const g of games) {
            counts[g.slug] = g.activePlayers;
          }
          setPlayerCounts(counts);
        }
      } catch {}
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageTransition>
      <UsernameDialog
        open={playerIdentity?.isFirstVisit || (playerIdentity !== null && !playerIdentity.username)}
        onConfirm={setUsername}
        onGenerate={generateAndSetUsername}
      />
      <main className="mx-auto flex w-full max-w-lg flex-col justify-center px-5 sm:px-6">
        <div className="mb-4 mt-4 flex items-center justify-end gap-2 sm:gap-3">
          {playerIdentity?.username ? (
            <span className="text-xs text-text-muted sm:text-sm">{playerIdentity.username}</span>
          ) : null}
          {animalIdentity ? (
            <AvatarPicker
              currentAnimal={animalIdentity.animal}
              currentColor={animalIdentity.color}
              allAnimals={allAnimals}
              allColors={allColors}
              onSelectAnimal={setAnimal}
              onSelectColor={(color) => setIdentity({ animal: animalIdentity.animal, color })}
            />
          ) : null}
          {animalIdentity ? <IdentityDisplay animal={animalIdentity.animal} color={animalIdentity.color} /> : null}
        </div>

        <div className="mb-12 mt-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Games for Strangers</h1>
          <p className="mt-2 text-muted-foreground">Pick a game. Play with strangers.</p>
        </div>

        <motion.div
          className="flex flex-col gap-4"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
        >
          {GAMES.map((game) => {
            const slug = game.href?.replace("/play/", "");
            const activePlayers = slug ? playerCounts[slug] : 0;
            return (
              <GameCard
                key={game.title}
                title={game.title}
                description={
                  activePlayers > 0 && !game.comingSoon
                    ? `${game.description} - ${activePlayers} playing now`
                    : game.description
                }
                icon={game.icon}
                href={"href" in game ? game.href : undefined}
                comingSoon={"comingSoon" in game ? game.comingSoon : undefined}
              />
            );
          })}
        </motion.div>

        <footer className="mb-8 mt-16 text-center text-xs text-muted-foreground">
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
    </PageTransition>
  );
}
