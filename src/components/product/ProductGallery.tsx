"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = { src: string; alt: string };

export function ProductGallery({
  images,
  name,
  badge,
}: {
  images: GalleryImage[];
  name: string;
  badge?: string;
}) {
  const list =
    images.length > 0
      ? images
      : [{ src: "/images/demo/shop/display-case.jpg", alt: name }];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)]!;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:aspect-[5/6] lg:aspect-[4/5]">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(520px 320px at 12% 8%, rgba(98,166,255,0.18), transparent 58%), radial-gradient(420px 280px at 88% 92%, rgba(87,240,255,0.14), transparent 55%)",
          }}
          aria-hidden
        />
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          className="object-cover transition duration-700 ease-out"
          sizes="(min-width: 1024px) 560px, 100vw"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/35 via-slate-950/5 to-transparent" />

        {badge ? (
          <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/90 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-800 backdrop-blur">
            {badge}
          </div>
        ) : null}

        {list.length > 1 ? (
          <div className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-slate-950/45 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {active + 1} / {list.length}
          </div>
        ) : null}
      </div>

      {list.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {list.map((img, idx) => {
            const selected = idx === active;
            return (
              <button
                key={img.src}
                type="button"
                onClick={() => setActive(idx)}
                className={`relative aspect-square overflow-hidden rounded-2xl border transition ${
                  selected
                    ? "border-[#62a6ff] ring-2 ring-[#62a6ff]/30"
                    : "border-slate-900/10 hover:border-slate-900/20"
                }`}
                aria-label={`View image ${idx + 1}`}
                aria-pressed={selected}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
