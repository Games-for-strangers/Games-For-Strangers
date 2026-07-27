"use client";

const SOUND_FILES = {
  "ui-click": "/sounds/ui-click.mp3",
  "round-start": "/sounds/round-start.mp3",
  "correct-guess": "/sounds/correct-guess.mp3",
  "incorrect-guess": "/sounds/incorrect-guess.mp3",
  "time-up": "/sounds/time-up.mp3",
} as const;

const cache = new Map<string, HTMLAudioElement>();

export function useSoundEffect() {
  return (name: keyof typeof SOUND_FILES) => {
    let audio = cache.get(name);
    if (!audio) {
      audio = new Audio(SOUND_FILES[name]);
      audio.preload = "auto";
      cache.set(name, audio);
    }
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };
}
