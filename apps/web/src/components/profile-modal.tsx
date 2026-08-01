"use client";

import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@gamesforstrangers/ui/components/button";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  currentUsername: string;
  onSave: (username: string) => void;
  onGenerate: () => string;
}

export function ProfileModal({ open, onClose, currentUsername, onSave, onGenerate }: ProfileModalProps) {
  const [value, setValue] = useState(currentUsername);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(currentUsername);
      setError("");
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, currentUsername]);

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
    onSave(trimmed);
    onClose();
  };

  const handleGenerate = () => {
    const generated = onGenerate();
    setValue(generated);
    setError("");
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-canvas/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mx-4 w-full max-w-sm rounded-2xl border border-border-default bg-surface-base p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Profile</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-text-muted">
              DISPLAY NAME
            </label>
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
              className="h-[48px] w-full rounded-lg border border-border-strong bg-surface-elevated px-4 text-base text-text-primary outline-none transition-all placeholder:text-text-subtle focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/12"
            />
            {error ? (
              <p className="mt-1.5 text-xs text-status-error">{error}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" size="md" className="flex-1">
              Save
            </Button>
            <button
              type="button"
              onClick={handleGenerate}
              className="flex items-center justify-center gap-1.5 rounded-full border border-border-default px-4 py-2.5 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              <Sparkles className="size-4" />
              Random
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
