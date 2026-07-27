"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Turnstile from "react-turnstile";

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
}

export function TurnstileWidget({ onToken }: TurnstileWidgetProps) {
  const [siteKey, setSiteKey] = useState<string | null>(null);

  useEffect(() => {
    setSiteKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null);
  }, []);

  const handleVerify = useCallback(
    (token: string) => {
      onToken(token);
    },
    [onToken],
  );

  if (!siteKey) return null;

  return (
    <Turnstile
      siteKey={siteKey}
      onVerify={handleVerify}
      theme="dark"
      appearance="interaction-only"
      className="opacity-40 hover:opacity-100 transition-opacity"
    />
  );
}
