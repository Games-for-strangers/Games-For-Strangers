"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePlayerIdentity } from "@gamesforstrangers/ui/hooks/use-player-identity";
import { useAnonymousIdentity } from "@gamesforstrangers/ui/hooks/use-anonymous-identity";
import { IdentityDisplay } from "@/components/identity-display";
import { ProfileModal } from "@/components/profile-modal";
import { UsernameDialog } from "@/components/username-dialog";

export default function Header() {
  const { identity: playerIdentity, setUsername, generateAndSetUsername } = usePlayerIdentity();
  const { identity: animalIdentity } = useAnonymousIdentity();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nav = (
    <>
      <Link
        href="/about"
        className="text-sm text-text-muted transition-colors hover:text-text-primary"
        onClick={() => setMobileMenuOpen(false)}
      >
        About
      </Link>
      {playerIdentity?.username ? (
        <button
          onClick={() => {
            setProfileOpen(true);
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 rounded-radius-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          {animalIdentity ? (
            <IdentityDisplay animal={animalIdentity.animal} color={animalIdentity.color} size="sm" />
          ) : null}
          <span className="hidden sm:inline">{playerIdentity.username}</span>
          <span className="sm:hidden">{playerIdentity.username}</span>
        </button>
      ) : null}
    </>
  );

  return (
    <header className="relative flex h-[72px] items-center justify-between border-b border-border-default px-5 md:px-8 lg:px-12">
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
        Games for{" "}
        <span className="bg-gradient-to-r from-brand-violet to-brand-blue bg-clip-text text-transparent">
          Strangers
        </span>
      </Link>

      <nav className="hidden items-center gap-4 md:flex">{nav}</nav>

      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="flex items-center justify-center rounded-radius-md p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary md:hidden"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {mobileMenuOpen ? (
        <>
          <div
            className="fixed inset-0 top-[72px] z-40 bg-bg-canvas/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="absolute right-0 top-full z-50 flex w-48 flex-col gap-1 rounded-radius-xl border border-border-default bg-surface-elevated p-3 shadow-lg md:hidden">
            <Link
              href="/about"
              className="rounded-radius-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            {playerIdentity?.username ? (
              <button
                onClick={() => {
                  setProfileOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 rounded-radius-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                {animalIdentity ? (
                  <IdentityDisplay animal={animalIdentity.animal} color={animalIdentity.color} size="sm" />
                ) : null}
                {playerIdentity.username}
              </button>
            ) : null}
          </nav>
        </>
      ) : null}
    </header>
  );
}
