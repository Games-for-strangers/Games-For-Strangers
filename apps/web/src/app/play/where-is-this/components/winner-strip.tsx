"use client";

import { useEffect, useState } from "react";

interface WinnerEntry {
  animal: string;
  country: string;
  time: number;
  id: string;
}

interface WinnerStripProps {
  entries: WinnerEntry[];
}

export function WinnerStrip({ entries }: WinnerStripProps) {
  const [visible, setVisible] = useState<WinnerEntry | null>(null);

  useEffect(() => {
    if (entries.length === 0) {
      setVisible(null);
      return;
    }
    const last = entries[entries.length - 1];
    setVisible(last);
    const timer = setTimeout(() => setVisible(null), 5000);
    return () => clearTimeout(timer);
  }, [entries]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
      <div className="mx-auto max-w-md rounded-xl bg-foreground/10 px-4 py-2 text-center text-sm backdrop-blur-sm">
        <span className="font-medium">{visible.animal}</span> guessed{" "}
        <span className="font-medium">{visible.country}</span> in{" "}
        <span className="font-medium">{((visible.time) / 1000).toFixed(1)}s</span>
      </div>
    </div>
  );
}
