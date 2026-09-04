"use client";

import Image from "next/image";
import { useState } from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

type ProductCardItemProps = {
  name: string;
  articleLabel: string;
  description: string;
  images: string[];
  fallbackImage: string;
  priceLabel: string;
  quantity: number;
  inStockLabel: string;
  outOfStockLabel: string;
};

export function ProductCardItem({
  name,
  images,
  fallbackImage,
  quantity,
  articleLabel,
  priceLabel,
  inStockLabel,
  outOfStockLabel,
  description,
}: ProductCardItemProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 250, height: 250 });

  const gallery = images.length > 0 ? images : [fallbackImage];
  const selectedSrc = imageFailed
    ? fallbackImage
    : (gallery[selectedIndex] ?? fallbackImage);
  const imageClassName =
    quantity > 0 ? "object-contain" : "object-cover opacity-50";
  const inStock = quantity > 0;

  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
      <div className="shrink-0">
        <div className="h-64 w-fit max-w-full overflow-hidden  rounded-2xl  ">
          <Image
            src={selectedSrc}
            alt={name}
            width={imageSize.width}
            height={imageSize.height}
            loading="eager"
            sizes="(min-width: 768px) 50vw, 100vw"
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              if (naturalWidth > 0 && naturalHeight > 0) {
                setImageSize({ width: naturalWidth, height: naturalHeight });
              }
            }}
            onError={() => {
              if (selectedSrc !== fallbackImage) {
                setImageFailed(true);
              }
            }}
            className={inStock ? "" : "opacity-50"}
            style={{ height: 250, width: "auto", maxWidth: "100%" }}
          />
        </div>

        <Swiper
          modules={[FreeMode]}
          freeMode
          slidesPerView="auto"
          spaceBetween={12}
          className="mt-3"
        >
          {gallery.map((src, index) => {
            const isSelected = index === selectedIndex && !imageFailed;

            return (
              <SwiperSlide key={`${src}-${index}`} style={{ width: "5.5rem" }}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${name} ${index + 1}`}
                  onClick={() => {
                    setSelectedIndex(index);
                    setImageFailed(false);
                  }}
                  className={`relative aspect-square w-full overflow-hidden rounded-xl ${
                    isSelected
                      ? " border-2 "
                      : ""
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="88px"
                    className={imageClassName}
                  />
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mt-1 flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
        </div>
          <p className="shrink-0 text-xl font-semibold text-textColor">
            {priceLabel}
          </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
        <p
          className={`mt-6 text-sm font-medium ${inStock ? "text-textColor" : "text-zinc-500 dark:text-zinc-400"}`}
        >
          {inStock ? inStockLabel : outOfStockLabel}
        </p>
        <br/>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{articleLabel}</p>
      </div>
    </div>
  );
}
