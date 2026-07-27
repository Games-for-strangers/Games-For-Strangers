"use client";

import Link from "next/link";
import { usePlayerIdentity } from "@gamesforstrangers/ui/hooks/use-player-identity";
import { useAnonymousIdentity } from "@gamesforstrangers/ui/hooks/use-anonymous-identity";
import { IdentityDisplay } from "@/components/identity-display";
import { ProfileModal } from "@/components/profile-modal";
import { UsernameDialog } from "@/components/username-dialog";
import { useState } from "react";

export default function Header() {
  const { identity: playerIdentity, setUsername, generateAndSetUsername } = usePlayerIdentity();
  const { identity: animalIdentity } = useAnonymousIdentity();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="flex h-[72px] items-center justify-between px-5 md:px-8 lg:px-12">
      <UsernameDialog
        open={playerIdentity?.isFirstVisit || (playerIdentity !== null && !playerIdentity.username)}
        onConfirm={setUsername}
        onGenerate={generateAndSetUsername}
      />
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        currentUsername={playerIdentity?.username ?? ""}
        onSave={setUsername}
        onGenerate={generateAndSetUsername}
      />

      <Link href="/" className="text-lg font-bold tracking-tight">
        Games for <span className="bg-gradient-to-r from-brand-violet to-brand-blue bg-clip-text text-transparent">Strangers</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/about"
          className="text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          About
        </Link>
        {playerIdentity?.username ? (
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 rounded-radius-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            {animalIdentity ? (
              <IdentityDisplay animal={animalIdentity.animal} color={animalIdentity.color} size="sm" />
            ) : null}
            <span>{playerIdentity.username}</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
