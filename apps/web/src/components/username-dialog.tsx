"use client";

import { Sparkles } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@gamesforstrangers/ui/components/button";

interface UsernameDialogProps {
  open: boolean;
  onConfirm: (username: string) => void;
  onGenerate: () => string;
}

export function UsernameDialog({ open, onConfirm, onGenerate }: UsernameDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (trimmed.length > 20) {
      setError("Name must be under 20 characters");
      return;
    }
    onConfirm(trimmed);
  };

  const handleGenerate = () => {
    const generated = onGenerate();
    setValue(generated);
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-canvas/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mx-4 w-full max-w-sm rounded-2xl border border-border-default bg-surface-base p-8 shadow-lg"
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Welcome, stranger
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            What should we call you?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              placeholder="Enter a name..."
              maxLength={20}
              autoComplete="off"
              spellCheck={false}
              className="h-[52px] w-full rounded-lg border border-border-strong bg-surface-elevated px-4 text-base text-text-primary outline-none transition-all placeholder:text-text-subtle focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/12"
            />
            {error ? (
              <p className="mt-1.5 text-xs text-status-error">{error}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg" className="w-full">
              Let&apos;s play
            </Button>
            <button
              type="button"
              onClick={handleGenerate}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              <Sparkles className="size-4" />
              Generate a name for me
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
