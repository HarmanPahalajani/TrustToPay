# Design System & Craft Floor — TrustToPay

<!-- Hallmark · v2.0.0 · genre: developer-infrastructure · theme: obsidian-fibre · hero: OriginKit Hero-49 + Hero-51 Hybrid -->

## 1. Visual World & Palette
- **Primary Canvas (`--background`)**: Deep Obsidian (`#060911` / `hsl(222 47% 4.5%)`)
- **Elevated Surface (`--card`)**: Graphite Slate (`#0C121E` / `hsl(220 43% 8.2%)`)
- **Interactive Surface (`--secondary`)**: Midnight Steel (`#131C2E` / `hsl(220 41% 12.8%)`)
- **Structural Hairline (`--border`)**: Subtle Cobalt-Slate (`#1B273D` / `hsl(219 38% 17.2%)`)
- **Primary Signal (`--primary`)**: Electric Cobalt (`#3B82F6` / `#6FC8FF` Fibre Arc highlight)
- **Verification Signal**: Emerald Core (`#10B981`)
- **Escalation Signal**: Amber Guardrail (`#F59E0B`)

## 2. Typography (2+1 Rule)
- **Display & Headlines (`font-display`)**: `Plus Jakarta Sans` (600–800 weight, `-0.03em` tracking, `text-wrap: balance`), paired with editorial italic serif accents (`Playfair Display` / `Georgia` italic) in the Hero 49 + Hero 51 composite headline.
- **Body Prose (`font-sans`)**: `Public Sans` (400–600 weight, 65–75ch measure, 1.6 line-height).
- **Telemetry, Digests & Ledger (`font-mono`)**: `JetBrains Mono` with mandatory `font-variant-numeric: tabular-nums`.

## 3. Hero Architecture (OriginKit Hero 49 + Hero 51 Synthesis)
- **Hero 49 Layer (Woven Fibre Arc)**: Full-bleed interactive WebGL canvas rendering 26 parabolic cobalt-cyan fibre strands (`#1B4FD8` -> `#6FC8FF` -> `#FFFFFF`) that part radially around the user's cursor, backed by a directional contrast scrim (`90deg` from `rgba(4,7,15,0.95)` to transparent) and a verified protocol source strip.
- **Hero 51 Layer (GrinIris Eye-Tracking & 3-Column Readout Deck)**:
  - Interactive ray-traced 3D WebGL eyeballs (`GrinIrisEye`) embedded directly inside the word **"l👀k"** in the display callout (*"See where autonomous agents l👀k when confidence drops"*), tracking cursor movement across the viewport.
  - Hero 51's signature 3-column bottom architectural deck (`border-t` divider):
    1. Concise editorial lead summary (`max-w-[36ch]`)
    2. Stacked primary & secondary action triggers (`48px` height, instant focus ring)
    3. Live monospace `<dl>` protocol readout (`tabular-nums` key-value pairs with dashed hairlines)

## 4. Impeccable & Hallmark Craft Floor Rules Enforced
- **No Unsolicited Eyebrow Clutter**: Section headings lead directly with natural human title case or numbered protocol steps where sequence carries meaning.
- **Single-Elevation Depth**: Cards use `1px` structural borders without conflicting wide drop shadows; no cards nested inside cards with heavy borders.
- **Browser Surfaces Themed**: Selection highlight, caret color, custom scrollbars, instant `:focus-visible` outline rings (`≥ 3:1` contrast), and `tabular-nums` across all numeric columns.
- **Motion & Accessibility**: `prefers-reduced-motion: reduce` respected in both CSS and WebGL shaders.
