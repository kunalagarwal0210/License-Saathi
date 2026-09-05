# Big Features: Workflow, Not One Long Chat — Project Reference

> Working notes on running large AI-assisted builds as a structured workflow
> instead of a single sprawling chat session.

---

## 1. The Core Rule

**A large feature never gets built in one long chat.** A long chat drifts,
forgets earlier decisions, and slowly loses the plot.

Instead: run a **workflow** — a script that puts multiple AI "workers" on
the job in a planned order, some in parallel, all inside firm limits.

---

## 2. How the Team Is Organized

Think film set, not lone writer.

| Role | Analogy | Job |
|---|---|---|
| **Orchestrator** | Director | Plans the work, writes each worker's exact instructions, hands them out, gathers results. Builds nothing itself. |
| **Workers** | Camera operators | Each builds one ticket. Independent tickets run **at the same time** — this is where the speed comes from. |
| **Cold reviewer** | Fresh critic | Gets only the finished result + spec, tries to break it. Built none of it, so it has no blind spots from having built it. |
| **Stop caps** | Producer's budget | A spending cap + a stop rule, set *before* anything runs, so the workflow can't run away. |

---

## 3. The Two Dials Per Role

For **every role**, set two things — not one:

1. **Model** — which AI. Pick on purpose:
   - Wide, repetitive building → cheaper/faster model.
   - The few genuinely hard pieces → stronger model.
2. **Reasoning level / effort** — how hard it thinks before answering:
   `low → medium → high → xhigh → max`
   - `low/medium`: quick, cheap pass — fine for simple, mechanical jobs.
   - `high/xhigh`: deep, careful thinking — planning and hard building.
   - `max`: most thorough setting — reserve for the final check, where being wrong is expensive.

### Example lineup (from the source material)
```
role           model       reasoning    what it does
orchestrator = Fable 5   @ xhigh   plans every worker's job
workers      = Opus 4.8  @ xhigh   do the building, side by side
cold review  = Fable 5   @ max     the final skeptic
```

> Fill in your own lineup for this project below once you've decided:

| Role | Model | Reasoning level |
|---|---|---|
| Orchestrator | Opus 4.8 | high / xhigh |
| Workers | Sonnet (default — mechanical, well-specced tickets); Opus for hard or design-judgment tickets | medium → high |
| Cold reviewer | Opus | max |

---

## 4. The Gated Front Door (`/superflow` pattern)

A setup skill that **refuses to start** until you've named the full lineup —
both dials, for all three roles — out loud. Then it pins those exact choices
onto every worker so the system can't quietly substitute a cheaper/weaker
model under load.

### Run sequence
1. Invoke the setup skill and describe the feature to build.
2. State the lineup explicitly: model + reasoning level for each role.
3. Confirm — the gate only opens once the lineup is named for this session.
4. Orchestrator plans tickets and writes worker instructions (your choices pinned in).
5. Workers build side by side, each on their own ticket.
6. Cold reviewer attacks the result and reports back.
7. **You** review the findings and decide what ships.

### Build your own version
A skill is just a saved text file of instructions. Yours needs to say:

> "Before you run anything, ask me for the three roles and their reasoning
> levels. Do not start until I answer. Then run the workflow, using exactly
> the models I named, pinned onto every worker."

Save it, name it (e.g. `/myflow`), and you have your own gated entry point.
Start by copying a workflow that already works, then wrap your own
questions around it.

---

## 5. Never Run a Loop Without a Stop Rule

A self-correcting loop (fix → re-check → fix...) can run away. Real example
from the source: **$26 burned in one session** retrying the same failing
step forever.

Before any loop starts, define:
- [ ] What "done" looks like.
- [ ] Max number of tries allowed.
- [ ] A spending cap.
- [ ] A rule: two rounds with no progress = stop.

> Trying the same thing a third time doesn't mean the third try works — it
> means your understanding of the problem is wrong.

---

## 6. What Stays Yours, Never Delegated

Regardless of how much the workflow automates:
- The final decision to **ship**.
- Anything touching the **live database**.
- Every judgement call about **how things look/feel** (UX/design taste).

---

## Quick Reference

- Big feature → **workflow**, never one long chat.
- Four parts: orchestrator, parallel workers, cold reviewer, stop caps.
- Every role: **model** + **reasoning level**, both named explicitly.
- Gate the workflow so the lineup must be stated before it runs.
- No loop without limits — the $26 lesson.
