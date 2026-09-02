"use client";

import Image from "next/image";
import { useState } from "react";

type ProductCardProps = {
  name: string;
  articleLabel: string;
  description: string;
  image: string;
  fallbackImage: string;
  priceLabel: string;
  quantity: number;
  inStockLabel: string;
  outOfStockLabel: string;
};

export default function ProductCard({
  name,
  articleLabel,
  description,
  image,
  fallbackImage,
  priceLabel,
  quantity,
  inStockLabel,
  outOfStockLabel,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = imageFailed || image.length === 0 ? fallbackImage : image;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-background dark:border-white/15">
      <div className="relative aspect-4/3 bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={imageSrc}
          alt=""
          fill
          loading="eager"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          onError={() => {
            if (imageSrc !== fallbackImage) {
              setImageFailed(true);
            }
          }}
          className={quantity > 0 ? "object-cover" : "object-cover opacity-50"}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug">{name}</h3>
          <p className="shrink-0 font-medium text-textColor">{priceLabel}</p>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{articleLabel}</p>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
        <p
          className={`mt-auto pt-2 text-sm ${quantity > 0 ? "text-textColor" : "text-zinc-500"}`}
        >
          {quantity > 0 ? inStockLabel : outOfStockLabel}
        </p>
      </div>
    </article>
  );
}
