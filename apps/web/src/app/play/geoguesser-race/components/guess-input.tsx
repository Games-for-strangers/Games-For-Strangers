"use client";

import { type FormEvent, useRef } from "react";

interface GuessInputProps {
  onSubmit: (guess: string) => void;
  disabled: boolean;
}

export function GuessInput({ onSubmit, disabled }: GuessInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (!value) return;
    onSubmit(value);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <input
        ref={inputRef}
        type="text"
        placeholder="Where is this?"
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-40"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Guess
      </button>
    </form>
  );
}
