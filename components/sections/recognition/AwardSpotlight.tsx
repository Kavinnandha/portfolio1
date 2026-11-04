import Image from "next/image";
import finale from "@/public/recognition/samsung-finale.webp";
import noida from "@/public/recognition/samsung-noida.webp";
import { awardSpotlight as s } from "@/lib/content";

/**
 * Photo spotlight for the headline award: the finale stage shot large,
 * the Samsung R&D visit beside it with the result written underneath.
 */
export default function AwardSpotlight() {
  return (
    <figure data-spotlight className="mt-12 grid grid-cols-12 gap-x-6 gap-y-6 md:mt-16">
      <div data-spotlight-photo className="col-span-12 self-start overflow-hidden bg-paper-2 lg:col-span-8">
        <Image
          src={finale}
          alt={s.photos.finale}
          placeholder="blur"
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="aspect-[3/2] h-auto w-full object-cover transition-transform duration-[1.6s] ease-out-expo hover:scale-[1.03]"
        />
      </div>

      <div className="col-span-12 grid content-start gap-6 md:grid-cols-2 md:items-end lg:col-span-4 lg:grid-cols-1 lg:content-between">
        <div data-spotlight-photo className="overflow-hidden bg-paper-2">
          <Image
            src={noida}
            alt={s.photos.noida}
            placeholder="blur"
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
            className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-[1.6s] ease-out-expo hover:scale-[1.03]"
          />
        </div>

        <figcaption data-spotlight-text>
          <p className="label text-muted">{s.label}</p>
          <p className="mt-3 text-title font-medium text-ink">{s.title}</p>
          <p className="mt-2 text-[1.0625rem] leading-snug font-medium tracking-[-0.01em] text-accent">{s.result}</p>
          <p className="mt-3 text-sm leading-snug text-muted">{s.detail}</p>
        </figcaption>
      </div>
    </figure>
  );
}
