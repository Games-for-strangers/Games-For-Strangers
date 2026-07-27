"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import { AnimalIcon } from "./animal-icon";

interface AvatarPickerProps {
  currentAnimal: string;
  currentColor: string;
  allAnimals: readonly string[];
  allColors: readonly string[];
  onSelectAnimal: (animal: string) => void;
  onSelectColor: (color: string) => void;
}

export function AvatarPicker({
  currentAnimal,
  currentColor,
  allAnimals,
  allColors,
  onSelectAnimal,
  onSelectColor,
}: AvatarPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-muted"
      >
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: currentColor }}
        >
          <AnimalIcon animal={currentAnimal} className="h-3/5 w-3/5 text-muted-foreground" />
        </span>
        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border bg-popover p-4 shadow-lg">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Pick your animal</p>
            <div className="mb-4 grid grid-cols-4 gap-1">
              {allAnimals.map((a) => (
                <button
                  key={a}
                  onClick={() => onSelectAnimal(a)}
                  className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted ${
                    a === currentAnimal ? "bg-muted font-semibold" : ""
                  }`}
                >
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: currentColor }}
                  >
                    <AnimalIcon animal={a} className="h-3/5 w-3/5 text-muted-foreground" />
                  </span>
                  {a}
                </button>
              ))}
            </div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Pick your color</p>
            <div className="grid grid-cols-5 gap-1">
              {allColors.map((c) => (
                <button
                  key={c}
                  onClick={() => onSelectColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                    c === currentColor ? "ring-2 ring-ring ring-offset-2" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
