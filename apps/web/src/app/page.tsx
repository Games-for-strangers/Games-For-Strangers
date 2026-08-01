"use client";

import { ArrowUpDown, Globe, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import { useState } from "react";
import { usePlayerCounts } from "@/hooks/use-player-counts";
import { useAnonymousIdentity } from "@gamesforstrangers/ui/hooks/use-anonymous-identity";
import { usePlayerIdentity } from "@gamesforstrangers/ui/hooks/use-player-identity";
import { AvatarPicker } from "@/components/avatar-picker";
import { DailyLeaderboard } from "@/components/daily-leaderboard";
import { GameCard } from "@/components/game-card";
import { IdentityDisplay } from "@/components/identity-display";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { UsernameDialog } from "@/components/username-dialog";

const GAMES = [
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
] as const;

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
      <main className="mx-auto flex w-full max-w-lg flex-col justify-center px-5 sm:px-6">
        <div className="mb-4 mt-4 flex items-center justify-end gap-2 sm:gap-3 xl:hidden">
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
            const slug = "href" in game ? game.href.replace("/play/", "") : undefined;
            const comingSoon = "comingSoon" in game ? game.comingSoon : false;
            const activePlayers = slug ? playerCounts[slug] : 0;
            return (
              <GameCard
                key={game.id}
                title={game.title}
                description={
                  activePlayers > 0 && !comingSoon
                    ? `${game.description} - ${activePlayers} playing now`
                    : game.description
                }
                icon={game.icon}
                href={"href" in game ? game.href : undefined}
                comingSoon={comingSoon || undefined}
              />
            );
          })}
        </motion.div>

        <DailyLeaderboard game="geoguesser-race" gameTitle="GeoGuesser Race" />
        <DailyLeaderboard game="higher-or-lower" gameTitle="Higher or Lower" />

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
