"use client";

import { Info, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlayerCounts } from "@/hooks/use-player-counts";
import { usePlayerIdentity } from "@gamesforstrangers/ui/hooks/use-player-identity";
import { useAnonymousIdentity } from "@gamesforstrangers/ui/hooks/use-anonymous-identity";
import { AvatarPicker } from "@/components/avatar-picker";
import { IdentityDisplay } from "@/components/identity-display";
import { Logo } from "@/components/logo";

const NAV_ITEMS = [
  { href: "/" as const, label: "Games", icon: LayoutGrid },
  { href: "/about" as const, label: "About", icon: Info },
];

const GAME_ACCENT: Record<string, string> = {
  "geoguesser-race": "bg-brand-violet",
  "higher-or-lower": "bg-brand-pink",
};

export function Sidebar() {
  const pathname = usePathname();
  const playerCounts = usePlayerCounts();
  const { identity: playerIdentity } = usePlayerIdentity();
  const { identity: animalIdentity, setAnimal, setIdentity, allAnimals, allColors } = useAnonymousIdentity();

  return (
    <aside className="sticky top-0 hidden h-svh flex-col border-r border-border-default bg-bg-elevated/60 p-5 backdrop-blur xl:flex">
      <Logo />

      <nav className="mt-8">
        <p className="type-eyebrow mb-3 pl-3">Menu</p>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-violet/15 text-brand-violet"
                    : "text-text-muted hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                <Icon className="size-4" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-8">
        <p className="type-eyebrow mb-3 pl-3">Online now</p>
        <div className="flex flex-col gap-1">
          {Object.entries(playerCounts).map(([slug, count]) => {
            const dot = GAME_ACCENT[slug] ?? "bg-presence-online";
            const label =
              slug === "geoguesser-race"
                ? "GeoGuesser Race"
                : slug === "higher-or-lower"
                  ? "Higher or Lower"
                  : slug;
            return (
              <div
                key={slug}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                <span className="flex-1 truncate text-text-muted">{label}</span>
                <span className="font-mono text-xs tabular-nums text-text-muted">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
        {animalIdentity && playerIdentity ? (
          <>
            <IdentityDisplay animal={animalIdentity.animal} color={animalIdentity.color} size="sm" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-text-primary">
                {playerIdentity.username}
              </span>
            </div>
            <AvatarPicker
              currentAnimal={animalIdentity.animal}
              currentColor={animalIdentity.color}
              allAnimals={allAnimals}
              allColors={allColors}
              onSelectAnimal={setAnimal}
              onSelectColor={(color) => setIdentity({ animal: animalIdentity.animal, color })}
            />
          </>
        ) : null}
      </div>
    </aside>
  );
}