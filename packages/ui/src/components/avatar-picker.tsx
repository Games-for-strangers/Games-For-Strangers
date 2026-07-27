"use client";

import { Settings } from "lucide-react";
import { useState } from "react";

interface AvatarPickerProps {
  currentAnimal: string;
  currentColor: string;
  allAnimals: readonly string[];
  onSelect: (animal: string) => void;
}

export function AvatarPicker({ currentAnimal, currentColor, allAnimals, onSelect }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-sm opacity-60 hover:opacity-100 transition-opacity"
        title="Change avatar"
      >
        <Settings className="size-3" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setOpen(false)}>
          <div
            className="rounded-xl border bg-background p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-sm font-medium">Pick your animal</p>
            <div className="grid grid-cols-5 gap-2">
              {allAnimals.map((animal) => (
                <button
                  key={animal}
                  type="button"
                  onClick={() => {
                    onSelect(animal);
                    setOpen(false);
                  }}
                  className={`flex size-10 items-center justify-center rounded-lg text-xl transition-all hover:scale-110 ${
                    animal === currentAnimal
                      ? "ring-2 ring-offset-2"
                      : "hover:bg-muted"
                  }`}
                  style={{
                    backgroundColor: animal === currentAnimal ? currentColor : undefined,
                    ringColor: currentColor,
                  }}
                >
                  {animal}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
