---
title: Paged context over a derivation graph
series: newt-agent
part: 2
dek: 'The goal is the effect of a huge context window without a huge window: bounded residency, unbounded reach. The model is never told it holds everything. It is told what it holds and that it can reach the rest.'
read_time: ~5 min
permalink: /series/newt-agent/paged/
wide: true
extra_css:
- /assets/css/newt.css
newt_demo: paged
authors:
- name: Shawn Hartsock
  role: commissioned
ai: drafted
status: draft
revisions:
- date: '2026-10-22'
  by: claude-sonnet-5-5
  note: Moved from newt-agent site/paged.html at 67b24697; prose converted to Markdown, animation text moved to copy.
copy:
  newt:
    fine: 'Everything on this page is intended behaviour, not shipped behaviour. Source: [docs/design/infinite-context-illusion.md](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/design/infinite-context-illusion.md). Keys: left/right arrows step, space plays or pauses.'
    nodes_0_label: Resident set
    nodes_0_sub: the window; small and bounded
    nodes_1_label: Derivation graph
    nodes_1_sub: every unit has a ContentId
    nodes_2_label: Unit X
    nodes_2_sub: not resident
    nodes_3_label: Model
    nodes_4_label: Pager
    nodes_4_sub: the context manager; a navigator
    nodes_5_label: Signals
    nodes_6_label: Relative genesis
    nodes_6_sub: new root after a break
    nodes_7_label: Branch not taken
    nodes_7_sub: stays addressable
    nodes_8_label: Another host
    stages_0_title: Bounded residency, unbounded reach
    stages_0_cap: 'A large window sells reachability and charges for residency. The work rarely needs residency: a coding turn needs the task, a few files and the recent turns. It needs to be able to get to anything else, cheaply and verifiably.'
    stages_0_note: Design only
    stages_1_title: The window holds a working set
    stages_1_cap: Only the working set is resident. Everything else stays in the graph, named by content, so the same bytes always have the same name.
    stages_1_tag_win: task, a few files, recent turns
    stages_1_note: Design only
    stages_2_title: A fault is visible and handled
    stages_2_cap: The model needs a unit that is not resident. Like a page fault in virtual memory, this is a visible, handled event. The model is told it has some things and can reach anything, never that it has everything.
    stages_2_tag_model: 'told: held vs reachable'
    stages_2_note: Design only. Builds on memory_fetch handles (implemented)
    stages_3_title: Served by retrieval or by re-derivation
    stages_3_cap: The pager resolves the content id and pages the unit in. Because the backing store is a derivation graph, a fault can also be served by re-deriving the unit from its sources, and the rebuild can be checked because identity comes from content.
    stages_3_note: Design only. Content addressing exists in agent-frame
    stages_4_title: Absent is labelled, never smoothed over
    stages_4_cap: 'A measured result drives the rule: a confident summary suppresses re-reading, while a labelled absence prompts it. So the model is never given a summary that implies it holds the whole.'
    stages_4_tag_model: navigates, does not invent
    stages_4_note: 'Measured: summarization-induced hallucination note'
    stages_5_title: A break becomes a transition
    stages_5_cap: 'When the budget cannot shrink further, the model changes, or the session moves, the old blocks derive a new root: a relative genesis. It names the parent it cannot produce. Unreachable is not the same as absent.'
    stages_5_tag_rel: unreachable, not absent
    stages_5_note: Design only
    stages_6_title: Branching needs a recorded choice
    stages_6_cap: One body of material can derive many candidate blocks. The choice and its reason are admitted facts in the frame, and the branch not taken stays addressable. Otherwise "re-derivable" is false.
    stages_6_note: Design only
    stages_7_title: Across the mesh, verify before rehydrating
    stages_7_cap: A signed block arrives from another host. Its identity is checked before it is rehydrated, and a host holding a block whose parent it lacks must say so.
    stages_7_tag_rel: identity verified first
    stages_7_note: Design only
    stages_8_title: How we would know it works
    stages_8_cap: 'Three signals: how often the model needs a non-resident unit, what each navigation costs, and whether it navigates when it should instead of inventing. The third is the false-completion rate already measured on terminal-bench.'
    stages_8_note: 'Third signal: measured today'
    stages_0_edges_0_2: can address any unit
    stages_1_edges_0_2: sees
    stages_1_edges_1_2: addresses
    stages_2_edges_0_2: needs X, not held
    stages_3_edges_0_2: resolve ContentId
    stages_3_edges_1_2: retrieve or re-derive
    stages_3_edges_2_2: page in
    stages_4_edges_0_2: labelled absence
    stages_5_edges_0_2: names the parent it cannot produce
    stages_6_edges_0_2: 'admitted: choice + reason'
    stages_6_edges_1_2: kept
    stages_7_edges_0_2: signed block + CID
    stages_8_edges_0_2: fault rate, fault cost, fault when it should
    back: Back
    play: Play
    pause: Pause
    next: Next
    jump: Jump to step
    step_of: Step {i} of {n}
    step_label: 'Step {i}: {title}'
---
[Context](/series/newt-agent/context/) / Paged context

> **Design only.** This page shows a design, stated by the maintainer on 2026-09-12, that has no implementation yet. The building blocks it rests on (content-addressed units, spill handles, `memory_fetch`) do exist and are marked in the table.

{widget newt-demo}

## What each stage maps to

| Stage | What it does | Where | Status |
|---|---|---|---|
| Content-addressed units | ContentId names; derived records name their sources. | [`agent-frame/src/`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/agent-frame/src/) | Implemented |
| Spill handles and memory_fetch | Verbatim spans stored under a CID and fetched on demand. | [`newt-core/src/agentic/memory_fetch.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/agentic/memory_fetch.rs) | Implemented |
| Paged residency | Bounded resident set with a pager serving faults. | [`docs/design/infinite-context-illusion.md`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/design/infinite-context-illusion.md) | Design only |
| Serve by re-derivation | Rebuild a unit from its sources and check it. | [`docs/design/infinite-context-illusion.md`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/design/infinite-context-illusion.md) | Design only |
| Relative genesis | New root that names the parent it cannot produce. | [`docs/design/infinite-context-illusion.md`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/design/infinite-context-illusion.md) | Design only |
| Recorded branch choice | Choice and reason are admitted facts; untaken branch stays addressable. | [`docs/design/infinite-context-illusion.md`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/design/infinite-context-illusion.md) | Design only |
| Verify before rehydrate | Received block identity checked first, across the mesh. | [`docs/design/infinite-context-illusion.md`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/design/infinite-context-illusion.md) | Design only |
| False-completion rate | The honesty signal, already measured. | [`docs/terminal-bench.md`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/terminal-bench.md) | Implemented |

## What this does not show

- Not infinite context. The doc states the intention as the effect of a huge window, and the mechanism as bounded residency with unbounded reach.
- An illusion presented to the operator is a goal. An illusion imposed on the model inside the loop is a defect, and the design forbids it.
- Open questions in the doc: the eviction policy and who owns it; whether a relative genesis carries replayable material; whether branches are ever garbage collected; and whether the "am I on a relative genesis" query costs a tool round.
- The doc also weighs names (paged context, atlas and chart, sheaf). The word "projection" is avoided because the codebase already uses it for something narrower.

*Source: newt-agent `site/paged.html` at `67b24697`. newt-agent is Apache-2.0: [Gilamonster Foundation / newt-agent](https://github.com/Gilamonster-Foundation/newt-agent).*
