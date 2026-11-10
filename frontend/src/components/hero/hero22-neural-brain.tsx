import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Hero22NeuralBrainProps {
  isAuthenticated?: boolean;
}

const CALLOUTS = [
  {
    id: "decision-engine",
    label: "Decision Engine",
    code: "CONF_GATE :: 0.75",
    detail: "Escalates ambiguous or high-risk steps to human specialists",
    color: "#365FEA",
    dotCx: 215,
    dotCy: 142,
    lineEndX: 82,
    lineEndY: 88,
    badgePosition: "left-2 top-5 sm:left-4 sm:top-7",
  },
  {
    id: "neural-processing",
    label: "Neural Processing",
    code: "HYBRID_KNN :: L1-L3",
    detail: "Semantic + keyword specialist routing & isolated verification",
    color: "#438866",
    dotCx: 368,
    dotCy: 168,
    lineEndX: 488,
    lineEndY: 106,
    badgePosition: "right-2 top-8 sm:right-4 sm:top-10",
  },
  {
    id: "agent-coordination",
    label: "Agent Coordination",
    code: "HMAC_SHA256 :: V1",
    detail: "Cryptographically signed handback & PayPal settlement",
    color: "#8C6239",
    dotCx: 318,
    dotCy: 294,
    lineEndX: 468,
    lineEndY: 348,
    badgePosition: "right-3 bottom-5 sm:right-5 sm:bottom-7",
  },
] as const;

const NEURAL_NODES = [
  { x: 185, y: 185, r: 3.2, delay: "0s" },
  { x: 215, y: 142, r: 4.5, delay: "0.4s", accent: "#365FEA" },
  { x: 256, y: 124, r: 3.0, delay: "0.9s" },
  { x: 304, y: 118, r: 3.5, delay: "1.3s" },
  { x: 348, y: 134, r: 3.0, delay: "0.6s" },
  { x: 368, y: 168, r: 4.5, delay: "1.1s", accent: "#438866" },
  { x: 392, y: 210, r: 3.2, delay: "0.2s" },
  { x: 360, y: 248, r: 3.4, delay: "1.5s" },
  { x: 318, y: 294, r: 4.5, delay: "0.7s", accent: "#8C6239" },
  { x: 266, y: 272, r: 3.2, delay: "1.2s" },
  { x: 222, y: 242, r: 3.5, delay: "0.5s" },
  { x: 278, y: 196, r: 3.8, delay: "0.8s" },
  { x: 322, y: 198, r: 3.4, delay: "1.4s" },
];

const PARTICLES = [
  { cx: 126, cy: 148, r: 1.8, dur: "5.2s" },
  { cx: 148, cy: 278, r: 2.2, dur: "6.4s" },
  { cx: 434, cy: 164, r: 1.8, dur: "4.8s" },
  { cx: 446, cy: 268, r: 2.0, dur: "5.9s" },
  { cx: 292, cy: 76, r: 1.6, dur: "6.1s" },
  { cx: 240, cy: 338, r: 2.0, dur: "5.5s" },
  { cx: 362, cy: 326, r: 1.7, dur: "4.6s" },
  { cx: 168, cy: 108, r: 1.5, dur: "6.8s" },
];

export function Hero22NeuralBrain({ isAuthenticated = false }: Hero22NeuralBrainProps) {
  return (
    <section
      data-originkit-hero="hero-22-neural-brain"
      className="relative overflow-hidden border-b border-[#E5E1D7] bg-[#F7F5EF] py-8 sm:py-11 lg:py-12"
    >
      {/* Subtle architectural grid backdrop */}
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

      <div className="container relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-6 lg:grid-cols-[1.02fr_1.08fr] lg:gap-8">
          {/* Left Column: Eyebrow, Bold Manrope Headline, Supporting Copy, Dual CTAs */}
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-md border border-[#E5E1D7] bg-[#FFFEFA] px-2.5 py-1 shadow-surface">
              <span className="h-2 w-2 rounded-full bg-[#365FEA]" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#202722]">
                Human-in-the-Loop Execution Protocol · MCP + Skill + REST
              </span>
            </div>

            <h1 className="font-heading text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] text-[#202722] sm:text-4xl lg:text-[2.75rem]">
              When AI gets stuck, human expertise moves it forward.
            </h1>

            <p className="max-w-[56ch] text-sm leading-relaxed text-[#69736D] sm:text-base">
              TrustToPay connects AI agents with verified human specialists to solve tasks that require human
              judgement, execution and verification.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button asChild size="lg" className="bg-[#365FEA] text-white hover:bg-[#2950D6]">
                <Link to={isAuthenticated ? "/app" : "/register"}>
                  Get Started <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#E5E1D7] bg-[#FFFEFA] text-[#202722] hover:bg-[#F0EEE7]"
              >
                <a href="#how-it-works">
                  <Compass className="size-4 text-[#438866]" /> Explore How It Works
                </a>
              </Button>
            </div>

            {/* Compact technical proof bar */}
            <div className="grid grid-cols-3 gap-2.5 border-t border-[#E5E1D7] pt-4">
              <div className="rounded-md border border-[#E5E1D7] bg-[#FFFEFA] px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#69736D]">Discovery</p>
                <p className="mt-0.5 font-heading text-xs font-bold text-[#202722]">Elastic Hybrid + L1–L3</p>
              </div>
              <div className="rounded-md border border-[#E5E1D7] bg-[#FFFEFA] px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#69736D]">Verification</p>
                <p className="mt-0.5 font-heading text-xs font-bold text-[#202722]">AST + Gemini Sandbox</p>
              </div>
              <div className="rounded-md border border-[#E5E1D7] bg-[#FFFEFA] px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#69736D]">Settlement</p>
                <p className="mt-0.5 font-heading text-xs font-bold text-[#202722]">PayPal + HMAC Handback</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero 22 Monochromatic Anatomical Brain Illustration with 3 Technical Callouts */}
          <div
            className="relative rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-3 sm:p-4 shadow-surface"
            aria-label="Anatomical neural-brain coordination diagram with Decision Engine, Neural Processing, and Agent Coordination callouts"
          >
            {/* Subtle top bar metadata */}
            <div className="flex items-center justify-between border-b border-[#E5E1D7] pb-2.5 px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#438866]" />
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#202722]">
                  COGNITIVE ESCALATION TOPOLOGY · HERO-22
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#69736D]">SYNC: ACTIVE</span>
            </div>

            <div className="relative h-[320px] sm:h-[360px] w-full overflow-hidden rounded-lg bg-[#F7F5EF]/75 mt-2.5 border border-[#E5E1D7]/70">
              <svg
                viewBox="0 0 580 400"
                className="h-full w-full select-none"
                role="img"
                aria-label="Monochromatic anatomical brain illustration with orbital trajectories and neural pathways"
              >
                <defs>
                  <radialGradient id="brainAura" cx="50%" cy="50%" r="52%">
                    <stop offset="0%" stopColor="#202722" stopOpacity="0.07" />
                    <stop offset="65%" stopColor="#69736D" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#F7F5EF" stopOpacity="0" />
                  </radialGradient>
                  <pattern id="fineDots" width="18" height="18" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.85" fill="#69736D" fillOpacity="0.24" />
                  </pattern>
                </defs>

                {/* Subtle dot matrix & radial wash */}
                <rect width="580" height="400" fill="url(#fineDots)" />
                <circle cx="290" cy="204" r="165" fill="url(#brainAura)" />

                {/* Orbital elliptical curves */}
                <g fill="none" stroke="#69736D" strokeOpacity="0.28" strokeWidth="1">
                  <ellipse
                    cx="290"
                    cy="204"
                    rx="198"
                    ry="118"
                    strokeDasharray="4 6"
                    transform="rotate(-14 290 204)"
                  />
                  <ellipse
                    cx="290"
                    cy="204"
                    rx="172"
                    ry="94"
                    strokeDasharray="2 5"
                    transform="rotate(19 290 204)"
                  />
                  <circle cx="290" cy="204" r="142" strokeOpacity="0.18" />
                </g>

                {/* Animated orbital ring particles */}
                <g>
                  {PARTICLES.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.cx}
                      cy={p.cy}
                      r={p.r}
                      fill="#69736D"
                      fillOpacity="0.55"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.25;0.75;0.25"
                        dur={p.dur}
                        repeatCount="indefinite"
                      />
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 0,-5; 0,0"
                        dur={p.dur}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </g>

                {/* Monochromatic Anatomical Brain Silhouette & Cortical Sulci / Gyri Outlines */}
                <g
                  fill="#FFFEFA"
                  fillOpacity="0.82"
                  stroke="#202722"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Main cerebral cortex outer contour */}
                  <path
                    d="M172 214
                       C154 202, 148 175, 162 154
                       C166 128, 190 108, 218 106
                       C236 88, 272 82, 300 90
                       C332 82, 368 94, 386 116
                       C414 126, 428 154, 420 182
                       C432 204, 424 234, 402 248
                       C396 270, 372 284, 346 282
                       C334 304, 308 318, 286 314
                       C274 296, 258 282, 236 276
                       C204 276, 178 256, 178 230
                       Z"
                    strokeWidth="2.2"
                  />

                  {/* Cerebellum & lower brainstem anatomical contour */}
                  <path
                    d="M322 276
                       C346 274, 372 284, 376 304
                       C378 322, 356 334, 330 330
                       C316 328, 304 318, 300 306"
                    fill="#F0EEE7"
                    strokeWidth="1.8"
                  />
                  {/* Brainstem */}
                  <path
                    d="M276 284
                       C278 308, 286 332, 294 352
                       L314 352
                       C308 332, 304 310, 304 288"
                    fill="#F0EEE7"
                    strokeWidth="1.8"
                  />
                </g>

                {/* Internal anatomical cortical folds (sulci/gyri) & corpus callosum */}
                <g
                  fill="none"
                  stroke="#202722"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Corpus callosum inner arch */}
                  <path
                    d="M222 198 C238 164, 308 158, 344 190 C332 206, 296 208, 256 206"
                    strokeWidth="1.75"
                    strokeOpacity="0.85"
                  />
                  {/* Frontal lobe gyri */}
                  <path
                    d="M174 176 C198 168, 214 152, 236 154 C252 156, 260 140, 276 132"
                    strokeWidth="1.4"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M190 138 C212 132, 230 118, 258 122"
                    strokeWidth="1.35"
                    strokeOpacity="0.65"
                  />
                  {/* Parietal & occipital cortical folds */}
                  <path
                    d="M286 112 C304 128, 326 124, 348 136 C366 146, 384 142, 402 158"
                    strokeWidth="1.4"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M342 168 C364 166, 386 180, 408 198"
                    strokeWidth="1.4"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M350 222 C372 216, 392 226, 406 238"
                    strokeWidth="1.35"
                    strokeOpacity="0.65"
                  />
                  {/* Temporal lobe lateral sulcus */}
                  <path
                    d="M192 222 C226 214, 258 224, 294 218 C324 212, 348 232, 368 250"
                    strokeWidth="1.6"
                    strokeOpacity="0.8"
                  />
                  <path
                    d="M204 248 C232 242, 258 252, 286 246"
                    strokeWidth="1.3"
                    strokeOpacity="0.65"
                  />
                  {/* Cerebellar folia horizontal striations */}
                  <path d="M318 292 C338 290, 356 296, 368 304" strokeWidth="1.2" strokeOpacity="0.65" />
                  <path d="M314 306 C334 304, 352 310, 364 316" strokeWidth="1.2" strokeOpacity="0.65" />
                </g>

                {/* Synaptic Neural Mesh Connecting Lines */}
                <g stroke="#202722" strokeOpacity="0.28" strokeWidth="1" strokeDasharray="3 3">
                  <line x1="185" y1="185" x2="215" y2="142" />
                  <line x1="215" y1="142" x2="256" y2="124" />
                  <line x1="256" y1="124" x2="304" y2="118" />
                  <line x1="304" y1="118" x2="348" y2="134" />
                  <line x1="348" y1="134" x2="368" y2="168" />
                  <line x1="368" y1="168" x2="392" y2="210" />
                  <line x1="368" y1="168" x2="322" y2="198" />
                  <line x1="215" y1="142" x2="278" y2="196" />
                  <line x1="278" y1="196" x2="322" y2="198" />
                  <line x1="278" y1="196" x2="222" y2="242" />
                  <line x1="222" y1="242" x2="266" y2="272" />
                  <line x1="266" y1="272" x2="318" y2="294" />
                  <line x1="322" y1="198" x2="360" y2="248" />
                  <line x1="360" y1="248" x2="318" y2="294" />
                </g>

                {/* Callout Pointer Lines */}
                {CALLOUTS.map((c) => (
                  <g key={c.id}>
                    <polyline
                      points={`${c.dotCx},${c.dotCy} ${(c.dotCx + c.lineEndX) / 2},${c.lineEndY} ${c.lineEndX},${c.lineEndY}`}
                      fill="none"
                      stroke={c.color}
                      strokeWidth="1.4"
                      strokeDasharray="3 2"
                    />
                    <circle cx={c.lineEndX} cy={c.lineEndY} r="2.8" fill={c.color} />
                  </g>
                ))}

                {/* Synaptic Neural Nodes */}
                {NEURAL_NODES.map((node, i) => (
                  <g key={i}>
                    {node.accent && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.r * 2.4}
                        fill={node.accent}
                        fillOpacity="0.18"
                      >
                        <animate
                          attributeName="r"
                          values={`${node.r * 1.6};${node.r * 2.9};${node.r * 1.6}`}
                          dur="2.8s"
                          begin={node.delay}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r}
                      fill={node.accent ?? "#202722"}
                      stroke="#FFFEFA"
                      strokeWidth="1.2"
                    />
                  </g>
                ))}
              </svg>

              {/* 3 Technical Callout Annotation Cards */}
              {CALLOUTS.map((callout) => (
                <div
                  key={callout.id}
                  className={` absolute z-10 max-w-[195px] rounded-md border border-[#E5E1D7] bg-[#FFFEFA]/95 px-2.5 py-1.5 shadow-surface backdrop-blur-[2px] ${callout.badgePosition}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: callout.color }}
                    />
                    <span className="font-heading text-[11px] font-bold text-[#202722]">
                      {callout.label}
                    </span>
                  </div>
                  <p
                    className="mt-0.5 font-mono text-[9px] font-medium"
                    style={{ color: callout.color }}
                  >
                    {callout.code}
                  </p>
                  <p className="mt-0.5 hidden text-[10px] leading-tight text-[#69736D] sm:block">
                    {callout.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom status strip inside Hero 22 card */}
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-[#69736D]">
              <span className="font-mono">
                <strong className="font-semibold text-[#202722]">3-NODE COORDINATION:</strong> Decision Engine · Neural Processing · Agent Coordination
              </span>
              <span className="font-mono text-[#438866]">VERIFIED HUMAN HANDOFF READY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
