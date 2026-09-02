# Design

<!-- impeccable:design-schema 1 -->

> **Status of this file.** This is the *foundation* visual system for LicenseSaathi, authored at ticket 00 **before the app scaffold exists** (ticket 01). Impeccable normally documents DESIGN.md from a built world; here it is written up-front because the project's hard rule is "finalize design before building." When the scaffold lands, the tokens below are implemented as real CSS custom properties and this file is reconciled against the built world (the `impeccable-documenter` pass). Until then, treat every value as the committed spec each UI ticket builds to.

---

## Direction contract — "The Route"

- **THESIS.** Getting licensed is a *journey with numbered, signposted stops*, not a pile of forms. LicenseSaathi is the route map to "shop open, legal." It refuses the category default — a sepia government document with a rubber stamp — which is exactly where an anxious first-timer's dread already lives and where every generic build lands.
- **OWN-WORLD.** Indian civic **wayfinding / transit signage**: a clean enamel signboard ground, a confident indigo **route line** threading numbered **stops** (licences), each stop a card that carries its own official **verified seal**. Functional, coded color (one job per color); glanceable signage type over warm readable body type. Recognizable with all content removed: the vertical route rail with stop nodes + seals.
- **STORY.** An anxious first-time owner sees their *whole path at a glance* ("5 stops, 2 cleared"), trusts each stop because it is stamped and dated with a real source, and feels guided ("you're on the right path") rather than buried.
- **FIRST VIEWPORT (Result screen, the payoff).** Top: "Setting up: {Category}, Ahmedabad · {N} stops". Immediately below, the **route rail** runs down the left with stop nodes; the current stop's **station card** is open, showing the green verified seal + "verified on <date>" + source link, fee and timeline (tabular), a document checklist, the official-portal CTA, and — clearly separated below a "field notes, not law" divider — amber traveller notes. Primary action (open portal / save checklist) is a full-width indigo button.
- **FORM.** Sequenced civic wayfinding (transit signage), assigned by the direction roll (seed `fea439d7`, mode `operate`, assigned index 6 of the grounded list). **Raised by** the *timetable slide-rack* challenger — one tight type scale where rank is carried by weight/case/rule, every row carrying its own timeline and a state mark in a fixed cell; **raised by** the *streetwear quote-grammar* challenger — every zone/state carries a literal, plain name; **raised by** the *teletext* challenger — a fixed color code where each color has exactly one job.
- **FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance. *(Discharged per-surface at each UI ticket's design gate, once there is a scaffold to build and screenshot.)*

---

## The load-bearing invariant

**The verified spine and community field-notes are never mixed** — not in color, container, type, or language. This is a product rule (PRODUCT.md) *and* the design's first job. Every surface that shows both must make them unmistakably different classes of information:

| | Verified spine | Community field-notes |
|---|---|---|
| Semantics | official, human-verified, cited | user-reported street reality |
| Color code | **green** (`--verified`) | **amber** (`--note`) — never green |
| Container | solid station card, full opacity | set-apart "traveller note", distinct edge, below a labelled divider |
| Language | "✓ verified on <date>", source link | "field notes, not law", reporter count |
| Never | — | never carries a ✓, never says "verified", never sits inside the spine card body |

If a design decision could let a field-note read as verified, it is wrong regardless of how it looks.

---

## Modes per surface family

| Surface | Mode | Note |
|---|---|---|
| Landing (01/05) | **Persuade** | The route as hero; Committed indigo. Shareable top-of-funnel. Inherits this world, amplified. |
| Questionnaire, Result, Dashboard, Checklist detail, Field-note capture, Admin | **Operate** | The working product. Scanability, state clarity, and the never-mix invariant outrank expression. Brand lives in the route rail, the seals, and precise type. |
| Reminder email (14) | Operate-lite | Not gated now; inherits palette + type + seal language when built. |

Choose the mode from the surface, not the product: the app is Operate even though the landing is Persuade.

---

## Color

**Physical scene:** a first-time owner on a phone, often outdoors or in a bright shop, in strong Indian daylight, glancing quickly. → **Light is the primary mode** (dark UIs wash out in sunlight and hurt fast legibility). Dark mode is a supported secondary (role swaps below), never the default.

**Strategy.** *Operate surfaces:* **Restrained ground + a fixed semantic code** — a neutral signboard ground with a disciplined functional palette where **each color owns exactly one job** (teletext discipline). Not decorative accents; the colors *are* the state system. *Persuade landing:* permission for **Committed** — the indigo route field may carry a large region.

Deliberately **not** the AI-default cream + high-contrast serif + terracotta. The ground is a cool enamel-signboard white, not parchment/cream.

### Tokens (light — primary)

```css
:root {
  /* Ground & surface — cool signboard, not cream */
  --ground:        #F7F8FA;  /* app background */
  --surface:       #FFFFFF;  /* cards, station cards */
  --surface-sunk:  #EEF1F5;  /* wells, secondary fills */
  --hairline:      #D7DCE3;  /* dividers, card borders */

  /* Ink */
  --ink:           #16202C;  /* primary text (cool near-black) */
  --ink-secondary: #52606D;  /* labels, secondary text */
  --ink-muted:     #8A97A5;  /* meta, placeholders */

  /* Route / primary — wayfinding indigo (ONE JOB: route, current step, primary action, links) */
  --route:         #1F4FD8;
  --route-strong:  #163CAB;  /* hover / pressed */
  --route-tint:    #E7EDFD;  /* selected / route-track fill */
  --on-route:      #FFFFFF;  /* text on --route */

  /* Verified / cleared — civic green (ONE JOB: verified spine, ✓, completed route segments) */
  --verified:      #147D5A;
  --verified-tint: #E1F1EA;

  /* Field-notes — warm ochre (ONE JOB: community "notes, not law") */
  --note:          #B26A00;
  --note-tint:     #FBF0DC;

  /* Flagged / error — vermilion (ONE JOB: ⚠ re-verify, form errors) */
  --flag:          #C0362C;
  --flag-tint:     #FBE7E4;

  --focus-ring:    #1F4FD8;  /* = route; 3px outer at 2px offset */
}
```

### Tokens (dark — secondary, role swaps only)

```css
:root[data-theme="dark"], @media (prefers-color-scheme: dark) /* guarded :root:not([data-theme="light"]) */ {
  --ground:        #0F151D;
  --surface:       #182230;
  --surface-sunk:  #0B1017;
  --hairline:      #2A3644;
  --ink:           #E6ECF3;
  --ink-secondary: #A9B6C4;
  --ink-muted:     #6E7C8B;
  --route:         #6E93FF;  --route-strong:#9DB6FF; --route-tint:#1B2A4A; --on-route:#0F151D;
  --verified:      #35B583;  --verified-tint:#123528;
  --note:          #E0A23C;  --note-tint:#3A2C11;
  --flag:          #F0766B;  --flag-tint:#3A1714;
}
```

Contrast: body/interactive text meets WCAG AA (≥4.5:1) on its ground; the four code colors are validated against both their tint and the base ground. Color is never the *only* signal — every state also carries an icon/label (✓ seal, "notes" label, ⚠), so the code survives color-blindness and grayscale printouts (the printable "bring these" pack).

---

## Typography

Two grounded families, chosen for the audience and the wayfinding world — not the training-default display serifs.

- **Signage register — `Overpass`** (Google Fonts; derived from Highway Gothic road signage). Used for: stop numbers, route/wayfinding labels, headings/display, numerals (tabular figures for fees, timelines, "X of N"). Carries the signage voice.
- **Body / reading register — `Hind`** (Google Fonts; Indian Type Foundry, humanist, Devanagari-native). Used for: plain-language licence descriptions, questionnaire copy, all running text. **Language-expansion path:** the Hind superfamily covers the future scripts with one system — Hind (Latin/Devanagari) now, **Hind Vadodara** for **Gujarati** later — so adding a second language needs no type rework (PRODUCT.md constraint).

```css
--font-signage: "Overpass", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
--font-body:    "Hind", "Overpass", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
```

Fallback stacks are real: every face degrades to a system humanist sans.

### Scale (mobile-first, rem; 1rem = 16px)

| Token | Size / line-height | Family / weight | Use |
|---|---|---|---|
| `--t-display` | 2rem / 1.15 | Overpass 700 | landing hero, route hero |
| `--t-h1` | 1.5rem / 1.25 | Overpass 700 | page titles |
| `--t-h2` | 1.25rem / 1.3 | Overpass 700 | section / station name |
| `--t-label` | 0.875rem / 1.2, tracked +0.02em, uppercase optional | Overpass 600 | signage labels, stop numbers, meta headers |
| `--t-body` | 1rem / 1.5 | Hind 400 | descriptions, questions, running text |
| `--t-body-strong` | 1rem / 1.5 | Hind 600 | emphasis in body |
| `--t-meta` | 0.8125rem / 1.4 | Overpass 500, tabular nums | fee, timeline, "verified on <date>" |
| `--t-micro` | 0.75rem / 1.35 | Overpass 500 | "field notes, not law", legal/disclaimer |

Numerals: **tabular figures** everywhere numbers align or update (fees, timelines, stop counts, progress). One type rhythm throughout; more space above a heading than below it.

---

## Spacing, rhythm, radii, elevation

Mobile-first, **8pt base grid**. One scale, used everywhere:

```css
--sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:24px; --sp-6:32px; --sp-7:48px; --sp-8:64px;
--radius-card:12px; --radius-control:10px; --radius-pill:999px;
--tap-min:48px;            /* minimum interactive target */
--gutter:16px;             /* page side padding on mobile */
--maxw-read:640px;         /* max content width; app is single-column mobile-first */
--elev-card: 0 1px 2px rgba(16,32,44,.06), 0 1px 1px rgba(16,32,44,.04);
--elev-raised: 0 6px 20px rgba(16,32,44,.10);
```

Layout is **single-column, mobile-first**; the route rail is the primary vertical structure. Desktop widths center content at `--maxw-read` (the app) or expand the Persuade landing; never a fixed-pixel grid that wraps.

---

## Motion

Wayfinding-native and restrained. Durations `--motion-fast:120ms`, `--motion:200ms`, `--motion-slow:320ms`; easing `cubic-bezier(.2,.6,.2,1)`.

- **Route draws / fills** as stops are cleared (the connector segment animates to green).
- **Seal stamps down** when a licence is verified/marked done (scale-in + settle on the ✓).
- Transitions between questionnaire steps move laterally (forward = the route advancing).
- **`prefers-reduced-motion`: no draw/stamp** — state changes are instant; expensive effects bounded; content visible by default.

---

## Core component primitives

Enough for the UI tickets (05–12, 15) to compose against. Each is specced here; implementation lands in the scaffold.

1. **Button / CTA.** Height `--tap-min`, `--radius-control`. *Primary:* `--route` bg, `--on-route` text (the one primary action per view). *Secondary:* surface bg, `--route` text + `--hairline` border. *Tertiary/link:* `--route` text only. Focus: `--focus-ring`. Full-width on mobile for the primary action.
2. **Route rail + stop node.** Vertical connector down the left. Node states: **done** = green filled disc + ✓; **current** = indigo ring (pulsing once on load, reduced-motion static); **upcoming** = hollow `--ink-muted` ring. Connector segment: green for cleared spans, `--route-tint` ahead. Header label "X of N cleared" (`--t-label`, tabular).
3. **Station card** (the core spine primitive — one licence). Surface bg, `--radius-card`, `--elev-card`. Contents in order: stop number + licence name (`--t-h2`); **verified seal** (see 4); meta row — fee `₹` + rough timeline (`--t-meta`, tabular); document checklist (checkable rows); official-portal deep-link button (primary or secondary CTA); then the **field-notes region** (see 5) below a labelled divider. This card *is* the verified spine — full opacity, solid, green-coded trust.
4. **Verified seal / badge.** Pill or stamp: green ✓ + "Verified · {date}" (`--t-meta`) + source-cite link (`--route`). *Flagged variant (post-MVP):* `--flag` "⚠ Re-verify" + last-verified date. Never appears on a field-note.
5. **Traveller note (field-note).** Amber-coded, visually a *different class*: set below a `── field notes, not law ──` divider, distinct container (dashed/ticket-stub left edge in `--note`, `--note-tint` ground), quotation styling, reporter count ("3 people reported…"). Never a ✓, never "verified". This is the never-mix invariant made physical.
6. **Category chip / selector.** The three categories (eatery/café · kirana/retail · salon) as large tap targets (`--tap-min`+), selected = `--route-tint` fill + `--route` border.
7. **Dense list row** (dashboard checklists). One type scale; **state mark in a fixed cell** at the row start (done ✓ green / pending hollow), name, tabular meta right-aligned (timetable-challenger discipline). Rank by weight/case, not size.
8. **Questionnaire controls.** One question per step, big option cards (radio/segmented), `--tap-min`, plain literal labels, progress tied to the route. Errors use `--flag` + text, never color alone.
9. **Utility.** Labelled hairline divider; badge/stamp base; document-checklist item (checkbox + label + optional "required"); toast/inline status using the code colors with icons.

---

## Accessibility & responsive floor

- Mobile-first; every interactive target ≥ `--tap-min`. AA contrast on all text/controls. Visible focus ring on every focusable element.
- Color never the sole signal (icon + label always accompany the code color) — survives color-blindness and the grayscale printable pack.
- Language-expansion-ready: no layout hard-codes English string lengths; the Hind superfamily is the Devanagari/Gujarati path.
- Content is legible and operable with motion disabled and at 200% text zoom.

---

## Not yet done at ticket 00 (carries to scaffold, ticket 01)

- Tokens above **implemented as real CSS custom properties** in the app.
- Component primitives **built** (currently specced, not coded).
- This DESIGN.md **reconciled against the built world** by the documenter, and the per-surface `FINISH` line discharged at each UI ticket's design gate.
