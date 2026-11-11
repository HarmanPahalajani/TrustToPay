---
name: TrustToPay Design System
description: High-trust, crisp enterprise-utility SaaS design system connecting AI workflows with verified human specialists.
colors:
  navy: "#10172A"
  navy-surface: "#162038"
  cobalt: "#4263EB"
  cobalt-hover: "#3451D1"
  indigo: "#7057F5"
  cyan: "#20BCE5"
  emerald: "#12A875"
  amber: "#F5A623"
  danger: "#E5484D"
  bg-main: "#F5F7FC"
  bg-secondary: "#EDF0F6"
  surface-card: "#FFFFFF"
  text-primary: "#141B2D"
  text-body: "#4E596E"
  text-muted: "#68738A"
  border-hairline: "#E4E9F2"
  border-strong: "#CBD5E1"
typography:
  hero:
    fontFamily: "Manrope, Inter, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  heading-page:
    fontFamily: "Manrope, Inter, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  heading-section:
    fontFamily: "Manrope, Inter, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  heading-card:
    fontFamily: "Manrope, Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  kpi-large:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-hover}"
  button-navy:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "10px 18px"
  card-surface:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

## Overview

TrustToPay uses a precision, solid-surface visual architecture engineered for clarity, financial credibility, and high signal density without decorative bloat. The aesthetic pairs authoritative deep navy (`#10172A`) anchors with a calm porcelain-slate canvas (`#F5F7FC`), crisp white work surfaces (`#FFFFFF`), structural hairline dividers (`#E4E9F2`), and focused cobalt (`#4263EB`) interactive emphasis. Every screen prioritizes unambiguous status comprehension, effortless vertical and horizontal alignment, and plain, human-friendly product terminology.

## Colors

| Token | Hex | Role |
|---|---|---|
| Deep Navy | `#10172A` | Hero container, sidebar navigation rail, code/workflow schematic panels, marketing footer |
| Navy Surface | `#162038` | Elevated tiles inside dark navy hero/schematic surfaces |
| Primary Cobalt | `#4263EB` | Primary actions, active navigation states, interactive focus rings |
| Cobalt Hover | `#3451D1` | Solid hover state for primary actions |
| Accent Indigo | `#7057F5` | Secondary semantic highlights and matching tags only |
| Accent Cyan | `#20BCE5` | Schematic connectors and subtle dark-surface node highlights |
| Emerald Verified | `#12A875` | Passed security checks, verified results, completed payments |
| Amber Pending | `#F5A623` | Active waiting states, reviews in progress, manual verification flags |
| Error Red | `#E5484D` | Rejected submissions, validation errors, failed states |
| Main Canvas | `#F5F7FC` | Global application and page canvas background |
| Secondary Canvas | `#EDF0F6` | Filter strips, inset well surfaces, subtle row headers |
| Card Surface | `#FFFFFF` | Primary cards, tables, modals, top header, partner strip |
| Primary Text | `#141B2D` | Headings, key metrics, labels, primary body contrast |
| Body Text | `#4E596E` | Multi-line descriptions, code-free explanations |
| Muted Text | `#68738A` | Timestamps, secondary metadata, subtitles (minimum 4.5:1 on `#FFFFFF`) |
| Hairline Border | `#E4E9F2` | 1px card, table, and divider outlines |

**Strict Prohibitions:** Zero blue-to-purple gradient backgrounds, zero gradient hero sections, zero gradient cards or CTA buttons, and zero glowing radial orbs or decorative blur blobs.

## Typography

- **Headings (`Manrope`, weights 600–700)**:
  - Hero Headline: `44px–48px`, `font-weight: 700`, `line-height: 1.08`, `-0.025em`
  - Page Title: `26px–30px`, `font-weight: 700`, `line-height: 1.2`, `-0.02em`
  - Section Heading: `20px–24px`, `font-weight: 600–700`, `line-height: 1.25`
  - Card Heading: `15px–18px`, `font-weight: 600`
  - **Ban**: Never use `Space Grotesk` or `Roboto`.
- **Body, UI & Tabular Numbers (`Inter`, weights 400–700)**:
  - Standard prose uses `14px–15px`, `line-height: 1.6`, comfortable measure (`max-width: 65ch`).
  - All numeric figures, currency amounts, counts, scores, and table metrics MUST apply `.tabular-nums` (`font-variant-numeric: tabular-nums lining-nums; font-feature-settings: "tnum", "lnum";`).
  - Large KPI counters: `32px–38px`, `font-weight: 700`. Secondary KPIs: `24px–30px`, `font-weight: 600`. Card stats: `22px–26px`, `font-weight: 600`. Payment amounts: `28px–36px`, `font-weight: 700`. Table numbers: `14px–15px`, `font-weight: 500–600`. Chart labels: `12px–13px`, `font-weight: 500`.
- **Technical Identifiers Only (`IBM Plex Mono`, weights 400–600)**:
  - Reserved strictly for Task IDs, transaction IDs, verification hashes, webhook references, and code snippets. Never use monospace for ordinary metrics, currency totals, or marketing section headings.
- **No Uppercase Eyebrow Kickers**: Do not place small tracked uppercase eyebrow labels above headings. Let clear `Manrope` headings plus concise subtitles establish hierarchy directly.

## Layout

- **Max Container Width**: `1320px` (`max-w-[1320px]`) on marketing pages with `16px / 24px / 32px` responsive horizontal padding (`px-4 sm:px-6 lg:px-8`).
- **Workspace Shell**: `260px` fixed dark-navy navigation rail on `lg+` screens with mobile slide-over drawer, sticky `64px` top header bar, and readable workspace grid (`max-w-[1240px]`).
- **Equal-Height Grid Rhythm**: Multi-column cards (such as the 6-step workflow grid `"From request to verified result"` on `lg:grid-cols-3 sm:grid-cols-2`) use equal row tracks (`auto-rows-fr` / `h-full`) with balanced content structure so adjacent cards never stagger awkwardly.
- **Responsive Zero-Overflow Guarantee**: Every grid child and code container uses `min-w-0` and explicit horizontal scroll (`overflow-x-auto`) on code blocks so `document.documentElement.scrollWidth <= window.innerWidth` across `1440px`, `1280px`, `768px`, `390px`, and `360px`.
- **No Nested Card Boxing**: Never nest bordered card containers inside other bordered cards. Inside an outer card, separate internal items with flat tonal dividers (`border-t border-[#E4E9F2]`) or inset fill (`bg-[#F5F7FC]`).

## Elevation & Depth

Depth is expressed through luminance steps (`#F5F7FC` canvas -> `#FFFFFF` surface -> `#EDF0F6` inset) and crisp `1px solid #E4E9F2` structural borders rather than heavy drop shadows:
- `shadow-surface`: `0 1px 2px rgba(16, 23, 42, 0.04), 0 1px 3px rgba(16, 23, 42, 0.03)` for flat cards.
- `shadow-elevated`: `0 8px 24px -6px rgba(16, 23, 42, 0.08), 0 2px 6px rgba(16, 23, 42, 0.04)` reserved strictly for dropdowns, popovers, dialogs, and hero interactive frames.

## Shapes

- **Border Radius**: `8px` (`rounded-lg`) for inputs, buttons, and small callouts; `12px` (`rounded-xl`) for workspace cards and panels; `16px` (`rounded-2xl`) for hero/featured frames; `9999px` for status pills.
- **Touch Targets**: All interactive buttons, tabs, and mobile menu controls meet `min-h-[40px]` desktop and `min-h-[44px]` touch targets on mobile.

## Components

- **Partner Strip (`POWERED BY`)**: Full-width white band immediately below the public header and above the deep-navy hero, displaying **PayPal**, **Elastic**, and **Render** logos in authentic colors with clean optical baseline alignment.
- **Hero Motion**: Static main headline (`"When AI gets stuck, human expertise moves it forward."`) paired with a single fixed-height subtle supporting line rotating across three crisp sentences (`"Find the right human expertise."`, `"Check the work before it returns."`, `"Send verified results back to your agent."`) using `300ms` exponential ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`), `2.8s` dwell, and full `prefers-reduced-motion` safety.
- **Status Badges**: Human-friendly status vocabulary mapped cleanly (`Payment ready`, `Automatic checks`, `Security checks`, `Additional security review`, `Waiting for further review`, `Submission rejected`, `Task progress`, `File integrity check`, `Secure digital signature`, `Find suitable specialists`).
- **PayPal Checkout Card**: Displays clear Reward Amount in tabular `Inter`, explicit `"Test payment — no real money will be charged."` notice for Sandbox, and clean PayPal Sandbox button/fallback without exposing env flags or internal secrets.

## Do's and Don'ts

- **Do** use `Manrope` for all headings, `Inter` with `tabular-nums lining-nums` for body copy and all numeric amounts/KPIs, and `IBM Plex Mono` strictly for IDs, hashes, and code blocks.
- **Do** keep public marketing and workspace flows free of developer setup instructions (`DEMO_MODE`, `PAYPAL_CLIENT_ID`, webhook secrets, Sandbox configuration steps).
- **Do** isolate technical integration references (REST API, Agent Skill, the 4 MCP tools) strictly to `/app/docs` and the developer preview on `/`.
- **Don't** render blue-to-purple gradients, ambient orbs, uppercase eyebrow kickers above titles, nested card borders, or `animate-bounce` animations anywhere in the codebase.
