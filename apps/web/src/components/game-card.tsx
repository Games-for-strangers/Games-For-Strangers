import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface GameCardProps {
  title: string;
  description: string;
  emoji: string;
  href?: string;
  comingSoon?: boolean;
}

export function GameCard({ title, description, emoji, href, comingSoon }: GameCardProps) {
  const content = (
    <div
      className={`group relative flex flex-col gap-3 rounded-2xl border-2 p-6 transition-all ${
        comingSoon
          ? "border-dashed opacity-50"
          : "hover:border-foreground/20 hover:shadow-sm active:scale-[0.98]"
      }`}
    >
      <span className="text-4xl">{emoji}</span>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {comingSoon ? (
        <span className="text-xs font-medium text-muted-foreground">Coming soon</span>
      ) : (
        <ArrowRight className="absolute bottom-6 right-6 size-5 transition-transform group-hover:translate-x-1" />
      )}
    </div>
  );

  if (comingSoon || !href) return content;

  return <Link href={href as any}>{content}</Link>;
}
