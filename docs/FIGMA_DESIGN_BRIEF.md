# Figma Design Brief — LicenseSaathi ("The Route")

**Who this is for:** you, designing the screens in Figma in parallel while the app's data + logic get built.
**The deal:** design freely. This file is not a rulebook of how screens must look — it is the small set of things that must stay true so your Figma work drops into the code **without rework**. Everything else is yours to shape.

The golden rule: **match the *tokens* and the *content contract*, not a layout.** If your screen uses these exact colors, fonts, spacing steps, and contains the required pieces, it maps to the code 1:1 — no matter how you arrange it.

---

## 1. Why rework happens (and how this file prevents it)

Rework comes from three things, not from "the layout looked different":

1. **Off-system values** — a color, font, or spacing that isn't in the code. The dev has to invent a new token or eyeball a match. → Fix: use the styles in §3, named exactly.
2. **Missing content** — a screen that forgot a required piece (e.g. the result card with no "verified on <date>" stamp). The dev has to redesign mid-build. → Fix: the per-screen checklists in §5.
3. **Breaking the one hard invariant** — letting community field-notes look verified. This is a product+legal rule, not taste. → Fix: §4.

Nail those three. Compose however you like around them.

---

## 2. The feeling to hit (this is yours — no rules, just intent)

**Thesis:** getting licensed is a *journey with numbered, signposted stops*, not a pile of forms. The app is a **route map** to "shop open, legal." Run *away* from the category cliché: sepia government paper, rubber stamps, dense forms — that's where a nervous first-timer's dread already lives.

**The world:** Indian civic **wayfinding / transit signage**. A clean enamel-signboard ground, a confident indigo **route line** threading numbered **stops** (licences), each stop stamped with its own **verified seal**. Glanceable signage type, warm readable body type, functional color where each color has exactly one job.

**The story a user should feel:** "I can see my *whole path at a glance* — 5 stops, 2 cleared. I trust each stop because it's stamped and dated with a real source. I feel guided, not buried."

The signature thing someone should recognize with all text stripped out: **the vertical route rail with stop nodes + seals.** How you draw that rail, the stops, the hero — completely open.

**Two moods, pick by screen:**
- **Landing = Persuade.** Permission to be bold; the indigo route can own a big region. Shareable, top-of-funnel.
- **Everything else (questionnaire, result, admin) = Operate.** The working product. Scanability and state-clarity beat expression. The brand lives in the rail, the seals, and precise type — not decoration.

---

## 3. The token contract → set these up as Figma Styles first

Do this once and your whole file becomes drop-in. **Name the styles exactly as below** (the names match the code variables), and building is mechanical translation.

### Color styles (light is primary — design in light first)

| Figma style name | Hex | Its ONE job — don't reuse it for anything else |
|---|---|---|
| `ground` | `#F7F8FA` | App background (cool signboard, **not** cream) |
| `surface` | `#FFFFFF` | Cards, station cards |
| `surface-sunk` | `#EEF1F5` | Wells, secondary fills |
| `hairline` | `#D7DCE3` | Dividers, card borders |
| `ink` | `#16202C` | Primary text |
| `ink-secondary` | `#52606D` | Labels, secondary text |
| `ink-muted` | `#8A97A5` | Meta, placeholders |
| `route` | `#1F4FD8` | **Route line, current step, primary buttons, links** — the wayfinding indigo |
| `route-strong` | `#163CAB` | Hover / pressed state of route |
| `route-tint` | `#E7EDFD` | Selected fill, route-track ahead |
| `on-route` | `#FFFFFF` | Text sitting on a `route` fill |
| `verified` | `#147D5A` | **Verified spine, the ✓, cleared route segments** — civic green |
| `verified-tint` | `#E1F1EA` | Soft green backgrounds |
| `note` | `#B26A00` | **Community field-notes only** — warm ochre. Never green. |
| `note-tint` | `#FBF0DC` | Field-note background |
| `flag` | `#C0362C` | Errors, "⚠ re-verify" |
| `flag-tint` | `#FBE7E4` | Error background |

> **One-job-per-color is the system, not a style choice.** Green *means* verified. Amber *means* field-note. Indigo *means* the path/action. If you use green as a decorative accent, it now lies about verification. Keep each color on its job.

Dark mode exists in code as role-swaps, but **design light-mode only** — dark is derived later, you don't need to draw it.

### Text styles (two fonts, both free on Google Fonts)

Install **Overpass** and **Hind** in Figma. Create these text styles:

| Style name | Font / weight | Size / line-height | Use |
|---|---|---|---|
| `display` | Overpass 700 | 32 / 37 | Landing hero |
| `h1` | Overpass 700 | 24 / 30 | Page titles |
| `h2` | Overpass 700 | 20 / 26 | Section / station (licence) name |
| `label` | Overpass 600 | 14 / 17, +2% tracking, uppercase optional | Signage labels, stop numbers, meta headers |
| `body` | Hind 400 | 16 / 24 | Descriptions, questions, running text |
| `body-strong` | Hind 600 | 16 / 24 | Emphasis in body |
| `meta` | Overpass 500, **tabular figures on** | 13 / 18 | Fee, timeline, "verified on <date>" |
| `micro` | Overpass 500 | 12 / 16 | "field notes, not law", disclaimers |

> **Overpass = the signboard voice** (numbers, labels, headings). **Hind = reading** (all sentences; it also carries the Gujarati path later). Turn on **tabular figures** anywhere numbers align or update — fees, timelines, "2 of 5 cleared."

### Spacing, size, shape (the 8-point grid)

- **Spacing steps — use only these:** 4, 8, 12, 16, 24, 32, 48, 64. Set them as a Figma variable collection if you like. More space *above* a heading than below it.
- **Corner radius:** cards `12`, buttons/inputs `10`, pills/chips `999` (full round).
- **Tap targets:** every button, chip, option, checkbox row ≥ **48×48**. This is a real constraint (thumbs, outdoors) — not negotiable.
- **Frame:** design mobile-first at **390 wide** (iPhone-class). Content column caps at **640** on bigger screens; the app is **single-column**, never a multi-column grid that wraps. Page side padding **16**.
- **Elevation:** cards get a *whisper* of shadow, not a drop. (`0 1px 2px` soft.) Keep it flat and signage-like.

### Motion (note it, don't build it)
Wayfinding-native and restrained: the route segment fills green as a stop clears; the seal "stamps" down when verified; steps slide laterally (forward = advancing). You can annotate these in Figma; I'll implement them. Reduced-motion users get instant state, no draw/stamp.

---

## 4. The one hard invariant — verified spine vs field-notes NEVER mix

This is the product's whole trust model and a legal line. On any screen showing both, they must read as **two different classes of information** — different color, container, and words:

| | **Verified spine** | **Community field-notes** |
|---|---|---|
| Means | Official, human-verified, cited | Someone's street report |
| Color | **green** (`verified`) | **amber** (`note`) — never green |
| Container | Solid station card, full opacity | Set-apart "traveller note": distinct edge (e.g. dashed/ticket-stub), `note-tint` ground, **below a labelled `── field notes, not law ──` divider** |
| Words | "✓ Verified · <date>", source link | "field notes, not law", "3 people reported…" |
| Never | — | never a ✓, never the word "verified", never inside the spine card body |

**Test every result-screen design against this:** if a field-note could be mistaken for verified law, the design is wrong regardless of how good it looks. This is the single thing I'll push back on.

---

## 5. Per-screen content contract (what must be present — arrangement is yours)

You decide layout, hierarchy, hero, illustration. Just make sure each screen carries its required pieces, or the build stalls.

### Landing (Persuade) — the front door, no login
- One-line value proposition (what this does, for whom — Ahmedabad micro-business owners).
- One clear primary CTA: "Find my licenses" (indigo, full-width on mobile).
- The three category choices as **big tap targets**: **eatery/café · retail/kirana · salon**. Selected = `route-tint` fill + `route` border.
- Selecting a category is what moves the user forward (carries the choice into the questionnaire).

### Questionnaire (Operate) — short, specific, low-friction
- **One question per step** (big option cards, thumb-friendly), progress tied to the route.
- 3–5 questions per category. Rough content (final wording flexible):
  - *Eatery:* seating vs cloud-kitchen, turnover band, alcohol yes/no.
  - *Retail/kirana:* turnover band, premises area.
  - *Salon:* premises, turnover band.
- **Back / edit** must be possible.
- Errors: `flag` color **plus text** — never color alone.

### Result list (Operate) — the payoff, the Must-ship core
- The **route rail** down the left with stop nodes; header like "Setting up: {Category}, Ahmedabad · {N} stops" and "X of N cleared" (tabular).
- Licences in **correct order, dependencies visible** (what must come before what).
- Each licence = a **station card** containing: stop number + licence name; plain-language description; required documents (checklist rows); government **fee (₹)** + rough **timeline** (tabular meta); a **deep-link button to the correct official portal**.
- Each verified licence shows its **verified seal**: green ✓ + "Verified · <date>" + a source-cite link.
- Field-notes (if shown) obey §4 — amber, below the divider, clearly "not law."
- Fully reachable and demoable **with no login**.

### Admin (Operate — scanability over expression) — internal, protected
- A protected panel (only admin reaches it) — assume a plain login gate; you can keep it visually minimal.
- **List / add / edit** licences and rules (dense list rows: state mark in a fixed cell at row start, name, tabular meta right-aligned).
- Set the **verify-stamp** on a licence: source URL + verified date.
- Goal is operational clarity, not beauty — this is where the verified spine is maintained. It can be the quietest screen.

---

## 6. What's fixed vs what's yours — quick reference

| Fixed (match these → zero rework) | Yours (design freely) |
|---|---|
| The 18 color values + their one-job meaning | Layout, composition, visual hierarchy |
| The two fonts + the type scale | How the route rail / stops / seals actually look |
| 8-pt spacing steps, radii, 48px taps, 390/640 widths | Hero treatment, imagery, empty states, micro-copy |
| The never-mix invariant (§4) | Iconography, illustration style, decorative texture |
| Each screen's required content (§5) | Ordering, emphasis, how you group things |
| Single-column, mobile-first | Anything not listed on the left |

If you want to break something on the left, that's a real decision — flag it to me and we'll change the token in code together so design and build stay in sync. Don't break it silently.

---

## 7. When a screen is done → handing it to me

For each finalized screen, send me any one of:
- A **PNG/JPG export** of the frame (fastest), or
- The **Figma share link** (I can view it), or
- A short note of any token you intentionally changed.

I'll rebuild it as real components against the live tokens. Because your styles are named to match the code, that step is translation, not reinterpretation — which is the whole point of this file.

Start with **Landing** and **Result** — they're the demo's front door and its payoff, and the two I'll need first.
