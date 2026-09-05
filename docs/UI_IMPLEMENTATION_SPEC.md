# LicenseSaathi --- Frontend Design & Claude Implementation Specification

**Purpose:** Final handoff specification for implementing the
LicenseSaathi frontend in Claude/VS Code without disturbing the backend
already under development.

**Status:** Implementation handoff\
**Primary visual reference:** `LicenseSaathi App Design.zip` / Figma
Make export\
**UX reference:** Approved Lovable prototype screenshots\
**Product/design rules:** Embedded LicenseSaathi Design Brief\
**Functional source of truth:** Existing application/backend/API
contracts

------------------------------------------------------------------------

## 1. Executive decision

Use the two generated prototypes for different strengths:

-   **Lovable is the UX reference** for the questionnaire flow, question
    wording, category selection and low-friction interaction model.
-   **Figma Make is the visual/UI reference** for typography, colors,
    spacing, route rail, station cards, verification treatment and
    overall visual language.
-   **The original Design Brief is the product/design-rule authority**
    for non-negotiable tokens, trust semantics, responsive constraints
    and required screen content.
-   **The existing backend is the functional authority.** Do not change
    backend architecture, API contracts, database schema, business rules
    or licence dependency logic to make the UI easier to implement.

The goal is NOT to merge two codebases. Translate the best UX decisions
from Lovable into the Figma visual system and implement that against the
existing application.

------------------------------------------------------------------------

# 2. Product experience

LicenseSaathi helps an Ahmedabad small-business owner understand which
licences/registrations they need and what to do next.

The user mental model should be:

**"Tell me what I am opening → ask me only what matters → show me my
route → tell me what I need at each stop → send me to the correct
official portal."**

The product should feel like a **civic wayfinding app**, not a
government form, legal document or generic SaaS dashboard.

The signature visual identity is:

**vertical route rail + numbered stops + verification seals**

The user should be able to understand their whole route at a glance.

------------------------------------------------------------------------

# 3. Design hierarchy

Use these priorities in order:

1.  Correct product behaviour and backend compatibility
2.  Trust clarity
3.  Information hierarchy
4.  Scanability
5.  Mobile usability
6.  Visual identity
7.  Decoration

Do not add visual complexity simply to make the interface look richer.

The design should become richer through:

-   stronger composition
-   route geometry
-   typography
-   iconography
-   status treatment
-   spacing
-   grouping
-   visual rhythm
-   subtle depth

NOT through:

-   more paragraphs
-   gradients everywhere
-   excessive cards
-   decorative illustrations without meaning
-   dashboard widgets
-   unnecessary animation

------------------------------------------------------------------------

# 4. Source-of-truth rules

## 4.1 Backend

The existing backend/application owns:

-   API contracts
-   database schema
-   data models
-   questionnaire/business logic
-   licence dependencies
-   authentication
-   real licence data
-   eligibility rules
-   result calculation

If the existing backend differs from prototype hardcoded data, use the
backend.

Do not duplicate backend logic in UI components.

Do not create a second data model just because the Figma export has one.

## 4.2 Figma Make

Use the Figma export as the implementation reference for:

-   visual hierarchy
-   design tokens
-   component anatomy
-   route rail
-   station cards
-   verified seal
-   field-note treatment
-   button treatment
-   typography
-   spacing
-   responsive constraints
-   overall composition

The Figma export is a prototype, not a second backend.

## 4.3 Lovable

Use Lovable as the reference for:

-   user journey
-   category selection
-   question sequence
-   question wording
-   supportive microcopy
-   option-card interaction
-   progress treatment
-   simple navigation

Do not copy Lovable's unrelated prototype content.

The Lovable generated examples include driving-licence/RTO/Bangalore
concepts. Those are NOT LicenseSaathi requirements.

------------------------------------------------------------------------

# 5. Visual design system

These values are fixed unless intentionally changed in the design
source.

## 5.1 Colors

  Token           Hex         Single purpose
  --------------- ----------- ---------------------------------------
  ground          `#F7F8FA`   App background
  surface         `#FFFFFF`   Cards/surfaces
  surface-sunk    `#EEF1F5`   Wells/secondary fills
  hairline        `#D7DCE3`   Borders/dividers
  ink             `#16202C`   Primary text
  ink-secondary   `#52606D`   Secondary text
  ink-muted       `#8A97A5`   Meta/placeholders
  route           `#1F4FD8`   Route/action/current step/primary CTA
  route-strong    `#163CAB`   Hover/pressed route state
  route-tint      `#E7EDFD`   Selected state/route track
  on-route        `#FFFFFF`   Text on route
  verified        `#147D5A`   Verified information only
  verified-tint   `#E1F1EA`   Verified soft background
  note            `#B26A00`   Community field notes only
  note-tint       `#FBF0DC`   Field-note background
  flag            `#C0362C`   Errors/re-verification
  flag-tint       `#FBE7E4`   Error background

### Hard semantic rule

**Indigo = route/action.**\
**Green = verified.**\
**Amber = community field notes.**\
**Red = error/re-verification.**

Never use green decoratively.

Never use amber for a generic warning if it could be confused with field
notes.

Never use the verified checkmark for community information.

------------------------------------------------------------------------

# 6. Typography

Use:

-   **Overpass** for headings, labels, numbers, signage and metadata.
-   **Hind** for body copy, questions and descriptions.

  Style         Font           Size / line height   Use
  ------------- -------------- -------------------- ------------------------
  display       Overpass 700   32 / 37              Landing hero
  h1            Overpass 700   24 / 30              Page titles
  h2            Overpass 700   20 / 26              Station/section titles
  label         Overpass 600   14 / 17              Signage labels
  body          Hind 400       16 / 24              Questions/descriptions
  body-strong   Hind 600       16 / 24              Body emphasis
  meta          Overpass 500   13 / 18              Fee/timeline/status
  micro         Overpass 500   12 / 16              Notes/disclaimers

Use tabular figures for fees, timelines and progress such as
`2 of 5 cleared`.

Do not replace the type system with generic SaaS fonts.

------------------------------------------------------------------------

# 7. Layout and responsive rules

Primary design target:

**390px mobile width**

Rules:

-   page side padding: `16px`
-   content max width: `640px`
-   single-column experience
-   no multi-column licence grid
-   minimum interactive target: `48 × 48px`
-   spacing values: `4, 8, 12, 16, 24, 32, 48, 64`
-   cards: `12px` radius
-   buttons/inputs: `10px` radius
-   pills: `999px`
-   elevation: subtle `0 1px 2px` style shadow
-   light mode is the primary design
-   dark mode should remain derived from the code token system, not
    redesigned independently

Desktop should center the same single-column experience rather than
turning it into an enterprise dashboard.

------------------------------------------------------------------------

# 8. Overall navigation / state model

The core public flow is:

**Landing** → choose category → **Questionnaire** → answer questions →
**Results / Route** → open official portal or inspect another station →
optionally restart

Admin is a separate protected/internal flow.

No login is required for the public demo flow.

The current category and questionnaire answers must survive navigation
within the flow.

------------------------------------------------------------------------

# 9. Landing screen

## Purpose

Persuade and orient.

The landing screen is allowed to be the boldest screen.

## Required hierarchy

1.  LicenseSaathi identity
2.  Clear value proposition
3.  Short explanation
4.  "What are you opening?" category selection
5.  Category cards
6.  Primary CTA

## Category choices

-   Eatery / Café
-   Retail / Kirana
-   Salon

Each is a large tap target.

Selected category:

-   `route-tint` background
-   `route` border
-   clear selection indicator

Use meaningful iconography where it improves recognition.

Do not turn the choices into plain radio buttons.

## Primary CTA

**Find my licenses**

The selected category is carried into the questionnaire.

## UX direction from Lovable

The category-selection pattern is strong and should be retained, but
visually elevate it using the Figma route/signage system.

------------------------------------------------------------------------

# 10. Questionnaire

## Core principle

The questionnaire should feel like a **guided journey**, not a form.

The Lovable prototype has the preferred UX pattern:

-   one question at a time
-   clear context label
-   large question
-   reassuring subtitle
-   large option cards
-   obvious selected state
-   route/progress indicator
-   Continue
-   Back

This interaction model should be retained.

## Preferred wording from Lovable

Where these questions apply, retain the wording because it is clearer
and more human:

### Eatery / Café

**How will you serve customers?**

Subtitle:

**Choose the option closest to your planned setup.**

Options:

-   **Customers can sit and eat**
    -   Dine-in, café or restaurant
-   **Cloud kitchen only**
    -   Delivery or takeaway, with no seating

**What yearly turnover do you expect?**

Subtitle:

**A rough estimate is enough. You can change it later.**

Options:

-   Up to ₹12 lakh
-   ₹12 lakh to ₹20 crore
-   Above ₹20 crore

**Will you serve alcohol?**

Subtitle:

**This affects which permissions appear on your route.**

Options:

-   No
-   Yes

### Retail / Kirana

Use the same concise, reassuring style.

Current Figma export wording includes:

**How much floor space will you use?**

and:

**What yearly turnover do you expect?**

The exported prototype also contains:

**Will you sell packaged or branded goods?**

Do not independently add or remove questions based only on this
document. The final question set must follow the existing backend
questionnaire contract.

### Salon

Current Figma export includes:

**How much floor space will you use?**

**What yearly turnover do you expect?**

**Will you offer any clinical or medical treatments?**

Again, the backend contract is authoritative for the final question set.

## Progress

Show progress clearly, e.g.:

`1 / 3`

The route/progress should visually communicate movement without
dominating the question.

## Selected option

Selected options should use:

-   route border
-   route-tint background
-   route check/selection indicator

Unselected options remain neutral.

## Navigation

Back must be available.

Continue must be obvious and full-width on mobile.

Do not force users to log in.

------------------------------------------------------------------------

# 11. Results / Route screen

This is the **core product experience** and deserves the most design
attention.

The user should immediately understand:

**What business am I setting up?**\
**How many stops are on my route?**\
**Which stops are cleared?**\
**What do I need to do next?**

## Header

Use a hierarchy similar to:

**Setting up: {Category}, Ahmedabad**

and:

**X of N cleared**

Use tabular figures for the count.

## Route rail

The route rail is the product's signature visual.

It should:

-   run vertically
-   connect numbered stations
-   distinguish completed/current/upcoming states
-   visually communicate progression
-   remain recognizable even if most text is removed

Avoid making it a generic progress bar.

## Station card

Each licence station should contain, as applicable:

-   stop number
-   licence name
-   plain-language description
-   status
-   required documents
-   government fee
-   rough timeline
-   official portal CTA
-   verification seal/source
-   community field notes, if available

The card should support expansion/collapse if the information density
requires it.

The top-level station header must remain scannable.

Do not create a wall of text.

------------------------------------------------------------------------

# 12. Station states

Use at least these conceptual states:

## Verified / cleared

-   strong route/indigo station node
-   verified information
-   green verified seal
-   green cleared route segment where appropriate

## Current / action needed

-   route/indigo emphasis
-   clear immediate action
-   prominent CTA
-   required documents visible or easy to reveal

## Upcoming / pending

-   neutral node
-   subdued connector
-   enough information to understand what is coming next

Do not invent states unsupported by the backend.

------------------------------------------------------------------------

# 13. Verification trust model

This is a hard invariant.

There are two fundamentally different information classes.

## Verified spine

Meaning:

Official, human-verified, cited information.

Treatment:

-   green
-   solid station card
-   green check
-   `Verified · <date>`
-   source citation/link

## Community field notes

Meaning:

Unofficial street/community reports.

Treatment:

-   amber
-   separate container
-   distinct edge/treatment
-   `note-tint` background
-   below a labelled divider:

**field notes, not law**

Possible supporting wording:

**3 people reported...**

Never:

-   green
-   checkmark
-   "verified"
-   inside the verified station card

### Acceptance test

If a user can reasonably mistake a community field note for verified
legal information, the implementation fails this requirement.

------------------------------------------------------------------------

# 14. Documents

Documents should be presented as a checklist, not a paragraph.

Each row should have:

-   document icon/checklist affordance
-   document name
-   readable spacing
-   clear grouping

Example data from the Figma prototype includes:

-   Aadhaar / PAN of proprietor
-   Proof of business address
-   Recent passport photo
-   NOC from landlord (if rented)

The actual document list must come from backend data when available.

------------------------------------------------------------------------

# 15. Fee and timeline

Fee and timeline are metadata, not primary narrative copy.

Use Overpass/meta styling and tabular figures.

Example:

**₹100--₹7,500**\
**7--30 working days**

Keep them visually easy to scan.

Do not turn these into large dashboard statistics.

------------------------------------------------------------------------

# 16. Official portal CTA

Each licence should provide a clear deep link to the correct official
portal.

CTA wording should come from backend data when available.

Examples in the Figma prototype include:

-   Apply on FOSCOS
-   Apply on AMC Portal
-   Register on Shram Suvidha
-   Register on GST Portal

The UI must not fabricate or substitute portal URLs.

------------------------------------------------------------------------

# 17. Admin

Admin is an internal operational interface.

Prioritize:

-   scanability
-   correctness
-   editability
-   verification maintenance

Do not over-design it.

Required concepts:

-   licence list
-   add licence
-   edit licence
-   rules
-   verification source URL
-   verification date
-   status

A dense list/table-like structure is acceptable here.

Authentication/protection should be provided by the existing application
architecture.

------------------------------------------------------------------------

# 18. Component architecture

Build reusable components rather than page-specific markup.

Recommended component set:

### AppShell

Owns global page/background/layout constraints.

### Header

Brand/navigation where required.

### RouteRail

Owns route line, nodes and state transitions.

### RouteNode

Represents a stop and its state.

### StationCard

Represents one licence.

### VerifiedSeal

Represents verified source/date.

### FieldNote

Represents community notes.

### Checklist

Represents required documents.

### OptionCard

Represents questionnaire choices.

### QuestionStep

Owns question/context/subtitle/options.

### ProgressSummary

Owns questionnaire/result progress display.

### Button

Owns primary/secondary/outline states.

### LicenceMeta

Owns fee/timeline metadata.

### OfficialPortalButton

Owns external portal CTA.

Do not duplicate the same styling in multiple pages.

------------------------------------------------------------------------

# 19. Implementation architecture

Before changing code:

1.  Inspect the existing repository.
2.  Identify frontend framework and routing.
3.  Identify API/data layer.
4.  Identify shared types/interfaces.
5.  Identify authentication.
6.  Identify existing design tokens/components.
7.  Identify questionnaire endpoints/state.
8.  Identify licence/result endpoints.
9.  Map the Figma component model to the existing architecture.

Then implement.

Do not replace working architecture merely because the Figma export is
simpler.

Do not copy the Figma prototype's hardcoded licence data into production
data structures.

Do not hardcode questionnaire branching in presentation components if
the backend already owns it.

------------------------------------------------------------------------

# 20. Figma export observations

The supplied Figma Make export contains:

-   React/TypeScript prototype code
-   Tailwind-based styling
-   exact design tokens
-   reusable primitives
-   questionnaire data
-   licence prototype data
-   route/station components
-   imported screenshots
-   original design brief

Useful implementation ideas include:

-   `StationCard`
-   `VerifiedSeal`
-   `FieldNote`
-   `Checklist`
-   `Btn`
-   `RouteRail`/route node patterns

However, these are **prototype implementation references**, not
instructions to transplant the entire Figma application.

The export's hardcoded `getLicences()` logic and licence objects must
not override the existing backend.

------------------------------------------------------------------------

# 21. Important prototype/content warning

The Figma and Lovable prototypes contain sample/generated content.

Examples of content that must NOT be imported merely because it appears
in a prototype:

-   driving licence / DL workflows
-   RTO
-   learner's licence
-   biometric appointment
-   Bangalore
-   invented case numbers
-   invented release/beta labels
-   unrelated application steps

LicenseSaathi is about **small-business licensing**, with Ahmedabad as
the initial geography.

------------------------------------------------------------------------

# 22. Source conflicts to resolve safely

The Figma prototype and brief are not perfectly identical in every
detail.

For example:

-   the brief describes the rough questionnaire content at a high level;
-   the exported Figma code contains additional category-specific
    questions/data;
-   the prototype contains concrete licence data and rules.

Do not silently choose one as factual backend logic.

Resolution rule:

**Existing backend contract → authoritative for behaviour/data**

**Approved UX wording → use Lovable's clearer wording where compatible**

**Design Brief → authoritative for visual tokens/trust rules**

**Figma → authoritative visual reference**

If a discrepancy affects a backend contract, stop and flag it rather
than modifying backend logic from prototype assumptions.

------------------------------------------------------------------------

# 23. Interaction and motion

Motion should be restrained and wayfinding-native.

Preferred concepts:

-   route segment fills as a stop clears
-   verified seal stamps into place
-   questionnaire steps slide laterally
-   forward navigation feels like moving along the route

Reduced-motion users should receive instant state changes.

Do not introduce animation everywhere.

Motion should clarify state, not decorate the interface.

------------------------------------------------------------------------

# 24. Accessibility and usability

Minimum requirements:

-   every interactive target ≥ 48×48px
-   visible selected states
-   visible keyboard focus
-   errors communicated with text plus visual treatment
-   do not rely on color alone
-   readable body text
-   external links clearly indicated
-   sufficient contrast
-   reduced-motion support
-   mobile-first touch interaction

The product should remain usable outdoors and on small screens.

------------------------------------------------------------------------

# 25. Screen-by-screen acceptance criteria

## Landing

-   [ ] Clear LicenseSaathi identity
-   [ ] Clear value proposition
-   [ ] Three business categories
-   [ ] Category cards are large tap targets
-   [ ] Selected state uses route tint/border
-   [ ] "Find my licenses" is prominent
-   [ ] No login required
-   [ ] Visually feels like a product, not a form

## Questionnaire

-   [ ] One question per screen
-   [ ] Lovable-style concise wording where approved
-   [ ] Helpful subtitle
-   [ ] Large option cards
-   [ ] Strong selected state
-   [ ] Progress visible
-   [ ] Back works
-   [ ] Continue works
-   [ ] No unnecessary questions added by UI
-   [ ] No Google-Form appearance

## Results

-   [ ] Category + Ahmedabad visible
-   [ ] X of N cleared visible
-   [ ] Vertical route rail is visually dominant
-   [ ] Numbered stops
-   [ ] Correct order/dependencies from backend
-   [ ] Station cards are scannable
-   [ ] Documents visible
-   [ ] Fee/timeline visible
-   [ ] Official portal CTA works
-   [ ] Verified seal/source/date works
-   [ ] Community notes are visually separate
-   [ ] No community note looks verified

## Admin

-   [ ] Protected by existing auth
-   [ ] Licence list
-   [ ] Add/edit capability according to backend
-   [ ] Verification source/date
-   [ ] Operationally scannable
-   [ ] No unnecessary visual complexity

------------------------------------------------------------------------

# 26. Recommended implementation order

Do not build every screen at once.

### Phase 1 --- Foundation

Implement:

-   tokens
-   typography
-   global layout
-   button system
-   OptionCard
-   RouteRail
-   RouteNode
-   VerifiedSeal
-   FieldNote
-   Checklist
-   StationCard

### Phase 2 --- Landing

Implement and validate the visual identity.

### Phase 3 --- Questionnaire

Implement the Lovable interaction model using the existing backend
questionnaire contract.

### Phase 4 --- Results

Give this the highest implementation/design attention.

### Phase 5 --- Admin

Implement the minimal operational interface.

### Phase 6 --- Integration QA

Validate:

-   API data rendering
-   branching
-   result calculation
-   portal URLs
-   auth
-   loading states
-   error states
-   mobile layout

------------------------------------------------------------------------

# 27. What NOT to do

Do not:

-   rebuild the backend
-   replace APIs
-   change database schema
-   invent licence rules
-   invent questionnaire branches
-   import prototype hardcoded data as authoritative
-   turn the route into a sidebar dashboard
-   make the UI dark by default
-   use generic SaaS gradients
-   use green as generic success
-   use amber for verified information
-   place field notes inside verified cards
-   turn the questionnaire into a multi-field form
-   add unnecessary login before the public flow
-   create a multi-column desktop dashboard
-   copy Lovable's unrelated driving-licence content
-   add decorative complexity without improving comprehension

------------------------------------------------------------------------

# 28. Final implementation principle

The finished application should satisfy this equation:

**Backend truth** + **Lovable's better UX flow** + **Figma's visual
system** + **Design Brief's trust rules** = **LicenseSaathi**

The user should experience:

**"I tell LicenseSaathi what I'm opening."**

→

**"It asks me only what matters."**

→

**"I can see my complete route."**

→

**"I know what is verified."**

→

**"I know what I need next."**

→

**"I can go directly to the correct official portal."**

The implementation is successful when the interface feels like a **clear
civic wayfinding product**, rather than a generated form or government
portal.

------------------------------------------------------------------------

## 29. Handoff checklist for Claude

Give Claude:

1.  This specification file.
2.  The complete `LicenseSaathi App Design.zip` Figma export.
3.  The existing application repository.
4.  Existing backend/API documentation or types.
5.  Final Figma screens once approved.

Tell Claude explicitly:

> The existing backend is authoritative. The attached Figma project is a
> visual implementation reference. The Lovable flow described in this
> specification is the UX reference. Do not merge prototype backend/data
> logic into the application.

Start implementation by inspecting the existing repository and mapping
its data contracts to the components described above.

**Do not begin by rewriting the application.**
