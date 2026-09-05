# Build Workflow — How We Build License-Saathi

> The execution model for building the tickets. Lightweight by default (this is a
> solo build): full orchestration machinery is used only when it earns its keep.
> Ties together the three practice references in this folder.

---

## 1. The model in one picture

```
tickets (00–15, dependency-ordered)   ← the plan already exists; frontier marks parallel sets
        │
   pick the next unblocked ticket(s)
        │
   ┌────┴────────────────────────────┐
   │ one ticket at a time (default)  │   OR   │ 2+ independent tickets → one worktree each │
   └────┬────────────────────────────┘        └────┬───────────────────────────────────────┘
        │                                            │
   build on a feature branch from origin/main    build in parallel, no shared folder
        │                                            │
        └───────────────┬────────────────────────────┘
                        │
             cold review before merge  (/code-review — fresh eyes, not the builder)
                        │
             human gate: you decide what ships
                        │
                  merge to main via PR
```

The tickets **are** the orchestrator plan: `Blocked by` gives dependency order, and the
frontier `{03, 05, 09}` notation marks sets that can be built in parallel.
See `docs/ai-workflow-orchestration.md` for the full pattern; this doc is our right-sized cut.

---

## 2. When to parallelize (and use worktrees)

| Situation | Do this |
|---|---|
| Building one ticket at a time | Plain feature branch from `origin/main`. No worktree ceremony. |
| Building 2+ **independent** tickets from a parallel set at once | **One git worktree per worker** — no exceptions. See `docs/git-worktrees.md`. |
| A clean fix needed while the main folder is mid-change | Fresh worktree branched from `origin/main`. |

Parallel workers are only safe in separate worktrees — a shared folder lets two sessions
silently overwrite each other.

---

## 3. Branch & push discipline (every time)

- **Branch from `origin/main`, named explicitly:** `git checkout -b feat/<ticket> origin/main`. Never a bare `checkout -b` with no base.
- **Before every push, list changed files:** `git diff main..HEAD --stat`. Only this feature's files should appear — unfamiliar files = stop and investigate.
- **Never push to `main` directly.** Merge via PR after cold review.
- **Undo by moving forward:** a shared mistake gets a fresh reverting commit, never a history rewrite once others have pulled it.
- **Fresh worktree:** install dependencies first; never trust a "green" test result from a project that never actually ran.

---

## 4. Gates before merge

A ticket is mergeable only when:
1. **Design gate** passed (UI tickets): surface finalized via `/impeccable shape` against `docs/DESIGN.md` and approved. (No page-building before this.)
2. **Feature flag** wired if user-facing: built behind its `FEATURE_*` flag, default off, shipped dark. See `docs/feature-flags-and-staging.md`.
3. **Cold review** done: `/code-review` (or a fresh agent that did not build it) attacks the result against the ticket's acceptance criteria.
4. **Human decision** to ship. Ship / live-DB / design-taste are never delegated.

---

## 5. Stop caps — no loop without a limit

Before starting any self-correcting loop (fix → re-check → fix…), state:
- [ ] What "done" looks like (the ticket's acceptance criteria).
- [ ] Max number of tries.
- [ ] **Two rounds with no progress = stop.** A third identical attempt means the understanding of the problem is wrong, not that the third try will work.

(The source lesson: a runaway loop burned $26 retrying one failing step.)

---

## 6. Roles & model lineup

Roles map to sessions/agents:
- **Orchestrator** — plans, writes each worker's exact instructions, gathers results, builds nothing.
- **Workers** — one ticket each; independent ones run in parallel worktrees.
- **Cold reviewer** — gets only the finished result + spec; tries to break it.

For each role, pin **model + reasoning level** on purpose. Fill in when building starts:

| Role | Model | Reasoning level |
|---|---|---|
| Orchestrator | Opus 4.8 | high / xhigh |
| Workers | Sonnet (default — mechanical, well-specced tickets); Opus for hard or design-judgment tickets | medium → high |
| Cold reviewer | Opus | max |

Rationale (per the guidance above): cheaper/faster Sonnet carries the wide mechanical building; the stronger Opus is reserved for the few hard pieces and for the final cold review, where being wrong is expensive. This is the lineup used from Ticket 02 onward (orchestrator = Opus, worker = Sonnet, cold review = Opus).

Guidance: wide/mechanical building → cheaper/faster model; the few hard pieces → stronger model;
reserve `max` reasoning for the final cold review, where being wrong is expensive.

---

## References
- `docs/ai-workflow-orchestration.md` — orchestrator/workers/cold-review pattern, stop caps.
- `docs/git-worktrees.md` — worktree rules and the empty-worktree trap.
- `docs/feature-flags-and-staging.md` — env/flags/staging, ship-dark, flip→build→prove.
- `docs/tickets/` — the plan; `00` is the design prefactor, UI tickets carry design gates.
