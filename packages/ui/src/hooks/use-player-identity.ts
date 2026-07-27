"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY_UUID = "gfs_uuid";
const STORAGE_KEY_USERNAME = "gfs_username";

const GUEST_PREFIXES = [
  "Strange", "Cosmic", "Neon", "Velvet", "Mystic",
  "Drift", "Echo", "Flux", "Glow", "Haze",
  "Jade", "Lunar", "Nova", "Orbit", "Pixel",
  "Quantum", "Rogue", "Sonic", "Tidal", "Void",
];

const GUEST_SUFFIXES = [
  "Fox", "Owl", "Cat", "Panda", "Wolf",
  "Bear", "Frog", "Raven", "Hawk", "Lynx",
  "Moth", "Nova", "Orbit", "Pixel", "Rune",
  "Shade", "Spark", "Storm", "Tide", "Wisp",
];

interface PlayerIdentity {
  uuid: string;
  username: string;
  isFirstVisit: boolean;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

function generateGuestUsername(): string {
  const prefix = GUEST_PREFIXES[Math.floor(Math.random() * GUEST_PREFIXES.length)];
  const suffix = GUEST_SUFFIXES[Math.floor(Math.random() * GUEST_SUFFIXES.length)];
  const num = Math.floor(Math.random() * 100);
  return `${prefix}${suffix}${num}`;
}

export function usePlayerIdentity() {
  const [identity, setIdentityState] = useState<PlayerIdentity | null>(null);

  useEffect(() => {
    let uuid = localStorage.getItem(STORAGE_KEY_UUID);
    let isFirstVisit = false;

    if (!uuid) {
      uuid = generateUUID();
      localStorage.setItem(STORAGE_KEY_UUID, uuid);
      isFirstVisit = true;
    }

    const storedUsername = localStorage.getItem(STORAGE_KEY_USERNAME);

    setIdentityState({
      uuid,
      username: storedUsername ?? "",
      isFirstVisit: isFirstVisit && !storedUsername,
    });
  }, []);

  const setUsername = useCallback((username: string) => {
    const trimmed = username.trim();
    localStorage.setItem(STORAGE_KEY_USERNAME, trimmed);
    setIdentityState((prev) => {
      if (!prev) return prev;
      return { ...prev, username: trimmed, isFirstVisit: false };
    });
  }, []);

  const generateAndSetUsername = useCallback(() => {
    const generated = generateGuestUsername();
    localStorage.setItem(STORAGE_KEY_USERNAME, generated);
    setIdentityState((prev) => {
      if (!prev) return prev;
      return { ...prev, username: generated, isFirstVisit: false };
    });
    return generated;
  }, []);

  const clearUsername = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_USERNAME);
    setIdentityState((prev) => {
      if (!prev) return prev;
      return { ...prev, username: "" };
    });
  }, []);

  return { identity, setUsername, generateAndSetUsername, clearUsername };
}
