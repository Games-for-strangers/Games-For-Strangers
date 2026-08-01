"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePlayerCounts } from "@/hooks/use-player-counts";
import { useAnonymousIdentity } from "@gamesforstrangers/ui/hooks/use-anonymous-identity";
import { usePlayerIdentity } from "@gamesforstrangers/ui/hooks/use-player-identity";
import { AvatarPicker } from "@/components/avatar-picker";
import { DailyLeaderboard } from "@/components/daily-leaderboard";
import { FeaturedGame } from "@/app/_components/featured-game";
import { GameCard } from "@/components/game-card";
import { IdentityDisplay } from "@/components/identity-display";
import { PageTransition } from "@/components/page-transition";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { UsernameDialog } from "@/components/username-dialog";
import { Globe, ArrowUpDown, HelpCircle } from "lucide-react";

const GAMES: readonly {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  comingSoon?: boolean;
}[] = [
  {
    id: "geoguesser-race",
    title: "GeoGuesser Race",
    description: "Race strangers to guess the country from a Street View image.",
    icon: Globe,
    href: "/play/geoguesser-race",
  },
  {
    id: "higher-or-lower",
    title: "Higher or Lower",
    description: "Does Japan have a higher population than Germany? Call it right to score.",
    icon: ArrowUpDown,
    href: "/play/higher-or-lower",
  },
  {
    id: "coming-soon-b",
    title: "Coming Soon",
    description: "Something mysterious is being built.",
    icon: HelpCircle,
    comingSoon: true,
  },
];

export default function Home() {
  const { identity: animalIdentity, setAnimal, setIdentity, allAnimals, allColors } = useAnonymousIdentity();
  const { identity: playerIdentity, setUsername, generateAndSetUsername } = usePlayerIdentity();
  const playerCounts = usePlayerCounts();
  const [usernameDone, setUsernameDone] = useState(false);

  return (
    <PageTransition>
      <UsernameDialog
        open={playerIdentity !== null && !usernameDone && (!playerIdentity.username || playerIdentity.isFirstVisit)}
        onConfirm={(name) => {
          setUsername(name);
          setUsernameDone(true);
        }}
        onGenerate={generateAndSetUsername}
      />
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 xl:py-10">
        <div className="mb-10 mt-1 flex items-center justify-end gap-2 sm:gap-3 xl:hidden">
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

        <div className="grid gap-10 xl:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <FeaturedGame />

            <section>
              <p className="type-eyebrow mb-2">Games</p>
              <h2 className="text-xl font-bold text-text-primary">Pick your game</h2>
              <motion.div
                className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                initial="initial"
                animate="animate"
                variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
              >
                {GAMES.map((game) => {
                  const slug = game.href?.replace("/play/", "");
                  const activePlayers = slug ? playerCounts[slug] : 0;
                  return (
                    <GameCard
                      key={game.id}
                      title={game.title}
                      description={game.description}
                      icon={game.icon}
                      href={game.href}
                      comingSoon={game.comingSoon}
                      slug={slug}
                      playersOnline={activePlayers}
                    />
                  );
                })}
              </motion.div>
            </section>
          </div>

          <aside className="space-y-8 xl:sticky xl:top-8 xl:self-start">
            <DailyLeaderboard game="geoguesser-race" gameTitle="GeoGuesser Race" compact />
            <DailyLeaderboard game="higher-or-lower" gameTitle="Higher or Lower" compact />
          </aside>
        </div>

        <footer className="mb-8 mt-16 text-center text-xs text-muted-foreground">
          No accounts. No tracking. Just play.
        </footer>

        <div className="fixed bottom-2 right-2 z-30">
          <TurnstileWidget onToken={() => {}} />
        </div>
      </main>
    </PageTransition>
  );
}