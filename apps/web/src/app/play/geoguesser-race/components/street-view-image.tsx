"use client";

import Image from "next/image";
import { useState } from "react";

interface StreetViewImageProps {
  imageUrl: string;
  city: string;
  country: string;
  landmark?: string;
}

export function StreetViewImage({ imageUrl, city, country, landmark }: StreetViewImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const gradients = [
      "from-sky-400 to-blue-600",
      "from-emerald-400 to-teal-600",
      "from-violet-400 to-purple-600",
      "from-amber-400 to-orange-600",
      "from-rose-400 to-pink-600",
      "from-cyan-400 to-indigo-600",
    ];
    const gradient = gradients[city.length % gradients.length];

    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} p-8 text-center text-white`}
      >
        <div className="space-y-2">
          <p className="text-4xl font-bold">{city}</p>
          <p className="text-lg opacity-80">{country}</p>
          {landmark ? <p className="text-sm opacity-60">{landmark}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-muted">
      <Image
        src={imageUrl}
        alt={`Street view of ${city}, ${country}`}
        fill
        className="object-cover"
        sizes="100vw"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}
