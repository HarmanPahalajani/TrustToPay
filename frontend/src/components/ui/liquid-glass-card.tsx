import { useRef, useState } from "react";
import { ElasticLogo, PayPalLogo, RenderLogo } from "@/components/partner-logos";
import { cn } from "@/lib/utils";

type PointerSpot = {
  x: number;
  y: number;
  active: boolean;
};

const PARTNERS = [
  {
    name: "PayPal",
    Logo: PayPalLogo,
    heightClass: "h-[21px]",
    pillClass:
      "border-[#93C5FD]/30 bg-gradient-to-b from-[#93C5FD]/[0.20] via-[#60A5FA]/[0.10] to-[#3B82F6]/[0.12] hover:border-[#93C5FD]/45 hover:from-[#93C5FD]/[0.26]",
  },
  {
    name: "Elastic",
    Logo: ElasticLogo,
    heightClass: "h-[21px]",
    pillClass:
      "border-[#6EE7B7]/25 bg-gradient-to-b from-[#6EE7B7]/[0.18] via-[#34D399]/[0.09] to-[#10B981]/[0.11] hover:border-[#6EE7B7]/40 hover:from-[#6EE7B7]/[0.24]",
  },
  {
    name: "Render",
    Logo: RenderLogo,
    heightClass: "h-[21px]",
    pillClass:
      "border-white/25 bg-gradient-to-b from-white/[0.18] via-white/[0.08] to-white/[0.11] hover:border-white/40 hover:from-white/[0.24]",
  },
] as const;

/**
 * Compact left-aligned Liquid Glass partner capsule inspired by dashersw/liquid-glass-js
 * optical rim refraction, positioned above the hero headline.
 */
export function LiquidGlassPoweredBy({ className }: { className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState<PointerSpot>({ x: 50, y: 50, active: false });

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  }

  return (
    <section
      ref={cardRef}
      aria-label="Powered by technology partners"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setSpot((prev) => ({ ...prev, active: false }))}
      className={cn(
        "group relative isolate inline-flex w-fit max-w-full overflow-hidden rounded-[28px] sm:rounded-full",
        "border border-white/25 px-4 py-2 sm:px-5 sm:py-2",
        "bg-gradient-to-b from-white/[0.09] via-white/[0.03] to-white/[0.06]",
        "backdrop-blur-2xl backdrop-saturate-150",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),inset_0_-1px_1.5px_rgba(148,163,184,0.16),0_0_24px_-4px_rgba(125,211,252,0.20),0_16px_32px_-12px_rgba(2,6,23,0.65)]",
        className,
      )}
    >
      {/* Subtle refractive rim sheen matching liquid-glass-js specular highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-8 -top-6 size-28 rounded-full opacity-45 blur-2xl"
        style={{
          background: "radial-gradient(circle, rgba(147,197,253,0.34) 0%, rgba(186,230,253,0.08) 55%, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-300 sm:rounded-full"
        style={{
          opacity: spot.active ? 1 : 0.4,
          background: `radial-gradient(160px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.14), transparent 68%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[1px] rounded-[27px] border border-white/[0.10] sm:rounded-full"
      />

      <div className="relative z-10 flex flex-wrap items-center gap-3 sm:gap-3.5">
        <span className="whitespace-nowrap pl-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#CBD5E1]">
          POWERED BY
        </span>

        <span aria-hidden="true" className="hidden h-5 w-px bg-white/15 sm:inline-block" />

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {PARTNERS.map(({ name, Logo, heightClass, pillClass }) => (
            <div
              key={name}
              className={cn(
                "relative flex h-9 items-center justify-center overflow-hidden rounded-full border px-4 py-1",
                "shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.28),inset_0_-1px_1px_rgba(15,23,42,0.35),0_6px_14px_-8px_rgba(2,6,23,0.6)]",
                "transition-all duration-200",
                pillClass,
              )}
            >
              <Logo tone="inverse" className={heightClass} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
