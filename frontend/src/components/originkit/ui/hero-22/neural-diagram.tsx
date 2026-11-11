/* eslint-disable */
// Delivered by Originkit (Hero 22) · adapted for React + Vite responsive container scaling
import { useEffect, useRef, useState } from "react";
import ParticleImage from "@/components/originkit/ui/hero-22/svg-particle";

/** Public asset under /originkit/hero-22/ */
function asset(file: string) {
  return `/originkit/hero-22/${file}`;
}

type Box = { left: number; top: number; width: number; height: number };

const SCATTER_PAD = 1.6;
const SCATTER_SCALE = 10 / SCATTER_PAD;

const padBox = (box: Box): Box => ({
  left: box.left - (box.width * (SCATTER_PAD - 1)) / 2,
  top: box.top - (box.height * (SCATTER_PAD - 1)) / 2,
  width: box.width * SCATTER_PAD,
  height: box.height * SCATTER_PAD,
});

/** Mobile logical stage (402 x 423) */
const HEAD_MOBILE: Box = { left: 83, top: 125, width: 236.264, height: 298.5 };
const BRAIN_MOBILE: Box = {
  left: HEAD_MOBILE.left + 13.3,
  top: HEAD_MOBILE.top + 16,
  width: 183.75,
  height: 156.75,
};

/**
 * Horizontal Hero 22 logical stage (864 x 456) centered directly on the head +
 * orbital arcs + three callouts from Originkit's 1440 x 468 desktop geometry
 * (shifted by DX = -310, DY = -14 so it fits the hero right column cleanly).
 */
const HEAD_DESKTOP: Box = { left: 252.99, top: 56, width: 315.018, height: 398 };
const BRAIN_DESKTOP: Box = {
  left: HEAD_DESKTOP.left + 17.7,
  top: HEAD_DESKTOP.top + 21.3,
  width: 245,
  height: 209,
};

type NodeSpec = {
  label: string;
  color: string;
  pillMobile: { left: number; top: number; width: number };
  pillDesktop: { left: number; top: number; width: number };
  dotMobile: { left: number; top: number };
  dotDesktop: { left: number; top: number };
  connectorMobile: Box & { path: string; shadow: string };
  connectorDesktop: { path: string };
};

const NODES: NodeSpec[] = [
  {
    label: "Decision Engine",
    color: "#aafc81",
    pillMobile: { left: 147, top: 40, width: 107.75 },
    pillDesktop: { left: 64, top: 55, width: 152 },
    dotMobile: { left: 195, top: 163 },
    dotDesktop: { left: 403, top: 97 },
    connectorMobile: {
      left: 204.34,
      top: 71,
      width: 16.4056,
      height: 102.364,
      path: "M15.6556 0V75L0.655616 102",
      shadow: "M14.6556 0V74.5L1.15562 101",
    },
    connectorDesktop: { path: "M216 74.5H389L416 110" },
  },
  {
    label: "Neural Processing",
    color: "#746ffc",
    pillMobile: { left: 25, top: 85, width: 119.75 },
    pillDesktop: { left: 18, top: 151, width: 168 },
    dotMobile: { left: 161.5, top: 220.75 },
    dotDesktop: { left: 299, top: 194 },
    connectorMobile: {
      left: 98.4,
      top: 115.53,
      width: 73.5876,
      height: 116.483,
      path: "M72.8376 114.969V89.4687L1.58757 0.468722",
      shadow: "M72.0876 116.469V89.9687L0.58757 0.468722",
    },
    connectorDesktop: { path: "M186 170.5H285L312 207" },
  },
  {
    label: "Agent Coordination",
    color: "#b801c1",
    pillMobile: { left: 249, top: 92, width: 125.75 },
    pillDesktop: { left: 673, top: 116, width: 175 },
    dotMobile: { left: 220, top: 204.75 },
    dotDesktop: { left: 457, top: 160 },
    connectorMobile: {
      left: 230.5,
      top: 122.42,
      width: 77.9827,
      height: 93.5766,
      path: "M0.75 92.0766V63.5766L76.5 0.576634",
      shadow: "M2 93.5766V64.0766L77.5 0.576634",
    },
    connectorDesktop: { path: "M673 135.5H497L470 173" },
  },
];

const ARCS = [
  {
    id: "arc-wide",
    boxDesktop: { left: -224, top: 59, width: 1255, height: 423 },
    viewBox: "0 0 1059.65 357.622",
    path: "M0.324945 357.36C0.324945 357.36 289.716 -0.340318 531.513 0.423133C772.18 1.18302 1059.32 357.36 1059.32 357.36",
  },
  {
    id: "arc-inner",
    boxDesktop: { left: 52, top: 52, width: 703, height: 405 },
    viewBox: "0 0 593.968 342.348",
    path: "M0.379579 342.171C0.379579 342.171 162.484 -0.307883 297.929 0.423081C432.741 1.15063 593.588 342.171 593.588 342.171",
  },
];

const ARC_DOTS = [
  { id: "arc-dot-1", left: 725, top: 403 },
  { id: "arc-dot-2", left: 705, top: 175 },
  { id: "arc-dot-3", left: 171, top: 238 },
];

const STAGE_SURFACE = "#10172A";

export const NeuralDiagram = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(560);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = typeof window !== "undefined" ? window.matchMedia?.("(prefers-reduced-motion: reduce)") : undefined;
    const syncMotion = () => setReducedMotion(!!mq?.matches);
    syncMotion();
    mq?.addEventListener?.("change", syncMotion);

    const el = outerRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      return () => mq?.removeEventListener?.("change", syncMotion);
    }
    const updateWidth = () => {
      const next = Math.round(el.getBoundingClientRect().width);
      if (next > 0) setStageWidth(next);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => {
      ro.disconnect();
      mq?.removeEventListener?.("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer || reducedMotion) return;
    let hovering = false;

    const getCanvas = () => outer.querySelector("canvas");

    const triggerAssemble = (e: PointerEvent) => {
      const canvas = getCanvas();
      if (!canvas) return;
      const box = canvas.getBoundingClientRect();
      const clientX =
        e.clientX >= box.left && e.clientX <= box.right ? e.clientX : box.left + box.width / 2;
      const clientY =
        e.clientY >= box.top && e.clientY <= box.bottom ? e.clientY : box.top + box.height / 2;
      canvas.dispatchEvent(
        new MouseEvent("mousemove", {
          bubbles: true,
          clientX,
          clientY,
        }),
      );
    };

    const onEnter = (e: PointerEvent) => {
      hovering = true;
      triggerAssemble(e);
    };

    const onMove = (e: PointerEvent) => {
      if (!hovering) hovering = true;
      triggerAssemble(e);
    };

    const onLeave = () => {
      hovering = false;
      const canvas = getCanvas();
      if (!canvas) return;
      canvas.dispatchEvent(
        new MouseEvent("mouseout", {
          bubbles: true,
          relatedTarget: document.body,
        }),
      );
    };

    outer.addEventListener("pointerenter", onEnter);
    outer.addEventListener("pointermove", onMove, { passive: true });
    outer.addEventListener("pointerleave", onLeave);
    return () => {
      outer.removeEventListener("pointerenter", onEnter);
      outer.removeEventListener("pointermove", onMove);
      outer.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  const isMobile = stageWidth < 420;
  const logicalWidth = isMobile ? 402 : 864;
  const logicalHeight = isMobile ? 423 : 456;
  const scale = isMobile ? Math.min(1, stageWidth / logicalWidth) : stageWidth / logicalWidth;
  const scaledWidth = Math.round(logicalWidth * scale);
  const scaledHeight = Math.round(logicalHeight * scale);

  const headBox = padBox(isMobile ? HEAD_MOBILE : HEAD_DESKTOP);
  const brainBox = isMobile ? BRAIN_MOBILE : BRAIN_DESKTOP;

  return (
    <div
      ref={outerRef}
      aria-label="Interactive human and AI neural coordination diagram"
      className="relative flex w-full items-center justify-center overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <div
        className="relative shrink-0 select-none"
        style={{
          width: logicalWidth,
          height: logicalHeight,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Background orbital arcs — horizontal Hero 22 composition */}
        {!isMobile &&
          ARCS.map((arc) => (
            <svg
              key={arc.id}
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={arc.boxDesktop}
              viewBox={arc.viewBox}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={arc.path} stroke="white" strokeOpacity="0.13" strokeWidth="1.2" />
            </svg>
          ))}

        {/* Waypoint dots on the orbital arcs */}
        {!isMobile &&
          ARC_DOTS.map((dot) => (
            <span
              key={dot.id}
              aria-hidden="true"
              className="pointer-events-none absolute size-[10px] rounded-full border-2 border-solid bg-[#c8c8cc]"
              style={{
                left: dot.left,
                top: dot.top,
                borderColor: STAGE_SURFACE,
                backgroundClip: "padding-box",
              }}
            />
          ))}

        {/* Halftone human-head particle silhouette */}
        <div className="absolute" style={headBox}>
          <ParticleImage
            width="100%"
            height="100%"
            backgroundColor="transparent"
            particleCount={20}
            particleSize={20}
            particleShape="circle"
            particleColor="single"
            singleColor="#d9d9d9"
            hoverEnabled={!reducedMotion}
            hoverConfig={{
              hoverType: "roam",
              roamShape: "oval",
              roamOpacity: 0.55,
              transition: { duration: 0.75, ease: "easeInOut" },
            }}
            repulsionEnabled={false}
            imageConfig={{
              image: asset("Vector.png"),
              mode: "fit",
              scale: SCATTER_SCALE,
            }}
          />
        </div>

        {/* Anatomical brain over the halftone head silhouette */}
        <img
          aria-hidden="true"
          src={asset("brain-only.png")}
          alt=""
          className="pointer-events-none absolute block max-w-none"
          style={brainBox}
        />

        {/* Connectors */}
        {isMobile ? (
          NODES.map((node) => (
            <svg
              key={`m-${node.label}`}
              aria-hidden="true"
              className="pointer-events-none absolute overflow-visible"
              style={{
                left: node.connectorMobile.left,
                top: node.connectorMobile.top,
                width: node.connectorMobile.width,
                height: node.connectorMobile.height,
              }}
              viewBox={`0 0 ${node.connectorMobile.width} ${node.connectorMobile.height}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={node.connectorMobile.shadow} stroke={STAGE_SURFACE} strokeWidth="1.5" />
              <path d={node.connectorMobile.path} stroke={node.color} strokeWidth="1.5" />
            </svg>
          ))
        ) : (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${logicalWidth} ${logicalHeight}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {NODES.map((node) => (
              <g key={`d-${node.label}`}>
                <path
                  d={node.connectorDesktop.path}
                  stroke={STAGE_SURFACE}
                  strokeWidth="2"
                  transform="translate(1.7 1.7)"
                />
                <path d={node.connectorDesktop.path} stroke={node.color} strokeWidth="2" />
              </g>
            ))}
          </svg>
        )}

        {/* Glowing node dots */}
        {NODES.map((node) => {
          const dotPos = isMobile ? node.dotMobile : node.dotDesktop;
          return (
            <span
              key={`dot-${node.label}`}
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full border-[3px] border-solid border-black"
              style={{
                left: dotPos.left,
                top: dotPos.top,
                width: isMobile ? 19.5 : 26,
                height: isMobile ? 19.5 : 26,
                backgroundColor: `${node.color}80`,
                backgroundClip: "padding-box",
              }}
            />
          );
        })}

        {/* Double-bordered callout pills */}
        {NODES.map((node) => {
          const pillPos = isMobile ? node.pillMobile : node.pillDesktop;
          return (
            <div
              key={`pill-${node.label}`}
              className="pointer-events-none absolute flex items-center justify-center border border-solid font-sans font-semibold whitespace-nowrap"
              style={{
                left: pillPos.left,
                top: pillPos.top,
                width: pillPos.width,
                height: isMobile ? 29 : 39,
                gap: isMobile ? 6 : 8,
                padding: isMobile ? 6 : "8px 12px",
                borderRadius: isMobile ? 0.75 : 1,
                borderWidth: isMobile ? 0.75 : 1,
                backgroundColor: STAGE_SURFACE,
                borderColor: node.color,
                boxShadow: `1.5px 1.5px 0px 0px ${STAGE_SURFACE}, 2.25px 2.25px 0px 0px ${node.color}`,
              }}
            >
              <span
                className="shrink-0"
                style={{
                  width: isMobile ? 6.75 : 9,
                  height: isMobile ? 6.75 : 9,
                  backgroundColor: node.color,
                }}
              />
              <span
                style={{
                  color: node.color,
                  fontSize: isMobile ? 11.25 : 15,
                  letterSpacing: isMobile ? "-0.225px" : "-0.3px",
                  lineHeight: 1.2,
                }}
              >
                {node.label}
              </span>
            </div>
          );
        })}
      </div>
      <span className="sr-only" data-stage-size={`${scaledWidth}x${scaledHeight}`} />
    </div>
  );
};

export default NeuralDiagram;
