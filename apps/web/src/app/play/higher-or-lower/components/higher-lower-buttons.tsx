"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { HigherLowerChoice } from "../types";

interface HigherLowerButtonsProps {
  onChoose: (choice: HigherLowerChoice) => void;
  disabled: boolean;
  chosen: HigherLowerChoice | null;
}

export function HigherLowerButtons({ onChoose, disabled, chosen }: HigherLowerButtonsProps) {
  return (
    <div className="flex w-full max-w-md gap-3">
      <ChoiceButton
        choice="higher"
        label="Higher"
        icon={<ArrowUp className="size-5" strokeWidth={2.5} />}
        onChoose={onChoose}
        disabled={disabled}
        chosen={chosen}
      />
      <ChoiceButton
        choice="lower"
        label="Lower"
        icon={<ArrowDown className="size-5" strokeWidth={2.5} />}
        onChoose={onChoose}
        disabled={disabled}
        chosen={chosen}
      />
    </div>
  );
}

interface ChoiceButtonProps {
  choice: HigherLowerChoice;
  label: string;
  icon: React.ReactNode;
  onChoose: (choice: HigherLowerChoice) => void;
  disabled: boolean;
  chosen: HigherLowerChoice | null;
}

function ChoiceButton({ choice, label, icon, onChoose, disabled, chosen }: ChoiceButtonProps) {
  const isChosen = chosen === choice;
  const isHigher = choice === "higher";

  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={() => onChoose(choice)}
      disabled={disabled}
      className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-base font-bold transition-colors disabled:cursor-not-allowed ${
        isChosen
          ? isHigher
            ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
            : "border-red-500 bg-red-500/15 text-red-400"
          : isHigher
            ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40"
            : "border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-40"
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
}
