---
title: How Newt manages context
series: newt-agent
part: 1
dek: A model's window is small and every turn re-sends it. When the window nears its budget, Newt does not throw the middle away. It keeps the task, keeps the recent work, saves the rest verbatim, and leaves the model a way to ask for it back. Step through two compactions below; the second shows how they chain.
read_time: ~5 min
permalink: /series/newt-agent/context/
wide: true
extra_css:
- /assets/css/newt.css
newt_demo: context
authors:
- name: Shawn Hartsock
  role: commissioned
ai: drafted
status: draft
revisions:
- date: '2026-10-22'
  by: claude-sonnet-5-5
  note: Moved from newt-agent site/context.html at 67b24697; prose converted to Markdown, animation text moved to copy.
- date: '2026-10-23'
  by: claude-opus-5-5
  note: Added a second compaction (steps 6 and 7) showing compaction handles chaining; checked against compress.rs with a two-pass test.
copy:
  newt:
    fine: 'Token counts and the handles are illustrative. The stages follow newt-core/src/agentic/compress.rs. Keys: left/right arrows step, space plays or pauses.'
    blocks_0_label: SYSTEM  system prompt + active-prompt card
    blocks_1_label: 'USER  task: make the failing test pass'
    blocks_2_label: ASSISTANT  read_file src/lib.rs
    blocks_3_label: TOOL  file contents
    blocks_4_label: ASSISTANT  grep "parse_header"
    blocks_5_label: TOOL  grep results
    blocks_6_label: ASSISTANT  edit_file src/lib.rs
    blocks_7_label: TOOL  diff applied
    blocks_8_label: TOOL  first test run (long log)
    blocks_9_label: SUMMARY  [CONTEXT COMPACTION — REFERENCE ONLY] … --- END OF CONTEXT SUMMARY ---
    blocks_10_label: ASSISTANT  run tests again
    blocks_11_label: TOOL  test output (2 failures left)
    blocks_12_label: USER  also update the changelog
    blocks_13_label: TOOL  memory_fetch result (needed lines only)
    blocks_14_label: ASSISTANT  read_file CHANGELOG.md
    blocks_15_label: TOOL  changelog contents
    blocks_16_label: ASSISTANT  run the full suite
    blocks_17_label: TOOL  full test run (long log)
    blocks_18_label: USER  now open the PR
    stages_0_title: Start of a session
    stages_0_cap: The window opens with the system prompt and the task. Both belong to the head, which is never summarized away.
    stages_0_zones: 'Head: system prompt and task.'
    stages_1_title: Work piles up
    stages_1_cap: Each tool call adds its result. Big outputs (file reads, logs) dominate. The window crosses the compaction trigger, and the budget guard is about to refuse the next send.
    stages_1_zones: 'Over the trigger: compaction runs before the next send.'
    stages_2_title: 1. Structural prune
    stages_2_cap: 'First, zero-cost passes shrink stale tool output. No model is called. Often this is enough. Here it is not: the window is still above the trigger.'
    stages_2_zones: Tool results shrunk in place. Still over the trigger.
    stages_3_title: 2. Mark the boundary
    stages_3_cap: The head stays. The tail stays, sized by a token budget rather than a message count, with the latest user request anchored in it. Everything between (dashed outline) is the middle. The cut lands between whole tool-call and result pairs.
    stages_3_zones: 'Head: kept.   Middle: to be compacted.   Tail: kept, user request anchored.'
    stages_4_title: 3. Spill the middle
    stages_4_cap: The middle is redacted of secrets and written to the store, verbatim, under a handle derived from its content. Nothing is lost yet, and nothing has left the window yet.
    stages_4_zones: Middle copied to the store.
    stages_4_store_0_body: verbatim middle span, 8 messages, secrets redacted
    stages_5_title: 4. Summarize and replace
    stages_5_cap: The middle becomes one reference-only card, fenced by start and end markers, carrying the handle. The window drops from over the trigger to about a quarter of the budget. If no summarizer is available, a plain "N messages were removed" marker takes its place.
    stages_5_zones: 'Window now: head + summary card + tail.'
    stages_5_store_0_body: verbatim middle span, 8 messages, secrets redacted
    stages_6_title: 5. The model pages detail back in
    stages_6_cap: Later the model needs the exact failing line the summary only paraphrased. It calls memory_fetch with the handle and receives just that part, verbatim. The summary told it what it holds, and where the rest is.
    stages_6_zones: memory_fetch compaction:‹cid›  →  a few lines come back.
    stages_6_store_0_body: 'served: lines for the failing assertion'
    stages_7_title: 6. The window fills again
    stages_7_cap: "Work goes on: the model reads the changelog and runs the full suite. The summary card is the harness's own message, so it never anchors the tail. It slides into the next middle with the old tail and the fetched lines, and the window crosses the trigger again."
    stages_7_zones: 'Head: kept.   Middle: first summary card onward.   Tail: kept, new request anchored.'
    stages_7_store_0_body: still addressable for the session
    stages_8_title: 7. Compactions chain
    stages_8_cap: 'The second spill stores that middle verbatim, first card included, so the new span carries the old handle. Fetch ‹cid₂› and the text names ‹cid₁›: the model walks back one hop at a time. Each handle is derived from content that holds the one before, so the newest handle pins the whole chain.'
    stages_8_zones: 'Window now: head + second card + tail.   Store: ‹cid₂› → ‹cid₁›.'
    stages_8_store_0_body: verbatim middle span, 7 messages, secrets redacted. It starts with the first summary card.
    stages_8_store_1_body: still addressable for the session
    stages_9_title: 8. The brake
    stages_9_cap: 'If compaction keeps reclaiming almost nothing, the loop would thrash. After two compactions in a row that each reclaim under 10%, auto-compaction is switched off for the session and the operator is told once. The budget guard stays hard: an over-budget send is refused, never silently truncated.'
    stages_9_zones: This run reclaimed far more than 10%, so no strike was recorded.
    stages_9_store_0_body: still addressable for the session
    stages_9_store_1_body: still addressable for the session
    col_window: Context window (what the model sees)
    legend_trigger: 'dashed line: compaction trigger'
    col_store: Spill store (content-addressed, off-window)
    antithrash: Anti-thrash
    meter_aria: Window usage
    meter_text: '{used}k of {budget}k tokens'
    meter_over: ' (over the trigger)'
    store_empty: Empty.
    store_link: ↓ named inside the span above
    strike_text: 'strikes: 0 of 2'
    strike_note: A strike is a compaction that reclaimed under 10%. Two in a row latch compaction off.
    back: Back
    play: Play
    pause: Pause
    next: Next
    jump: Jump to step
    step_of: Step {i} of {n}
    step_label: 'Step {i}: {title}'
---
{widget newt-demo}

## Going further

How [**agent-frame**](/series/newt-agent/frame/) relates: this page is the default compaction path, which does not use it. The opt-in smart harness does, to record the session and validate which context to keep.

[**Paged context**](/series/newt-agent/paged/) is the design that would extend this: bounded residency with unbounded reach, served from a derivation graph. It is not built yet, and the page says which parts are.

## What each stage maps to

| Stage | What it does | Where |
|---|---|---|
| Structural prune | Zero-LLM-cost passes shrink stale tool output first. Most triggers end here. | [`compress.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/agentic/compress.rs) |
| Boundary | Head is every leading system message plus the active-prompt card, so the task can never be summarized away. The tail is protected by a token budget, with the latest user message anchored in it. The cut never splits a tool call from its result. | `compress.rs` |
| Spill | The verbatim middle is redacted and stored under a content-addressed handle (a BLAKE3 CID). Same bytes, same handle. | [spill identity decision](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/decisions/1528b3-cid-spill-identity.md) |
| Summarize | A summarizer writes a reference-only card, fenced by start and end markers so weak local models do not read it as a fresh request. No summarizer, or a failed one, falls back to a plain "N messages were removed" marker and the turn goes on. | `compress.rs` |
| Page fault | The model calls `memory_fetch` with the handle and gets the verbatim span back, only when it needs the detail. | `newt-core/src/agentic/memory_fetch.rs` |
| Chain | A later compaction's middle starts with the earlier summary card: harness-owned messages never anchor the tail. The spill stores that card verbatim, handle included, so each span names the one before it and the newest handle reaches every earlier span. | `compress.rs` (`is_compaction_message`, `stage_compaction_span`) |
| Anti-thrash | Two compactions in a row that each reclaim under 10% turn auto-compaction off for the session and tell the operator once. The budget guard stays hard: an over-budget send is refused, never silently truncated. | `CompressState` in `compress.rs` |

## Built, and not yet built

The design behind this is progressive disclosure: the window is a budgeted resource and the model pulls what it needs. The model is never told it holds everything. It is told what it holds and that the rest is reachable, because a confident summary suppresses re-reading while a labelled absence prompts it ([measured here](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/notes/2026-06-13-summarization-induced-hallucination.md)).

The wider idea, [paged context over a derivation graph](/series/newt-agent/paged/), is recorded intent and has no implementation yet. The animation above does not depict it; the linked page animates the design and labels it as such.

## Try it

```
git clone https://github.com/Gilamonster-Foundation/newt-agent
cd newt-agent
just install
newt
```

The first run opens a setup wizard. `newt --help` is the authority on what the binary does.

*Source: newt-agent `site/context.html` at `67b24697`. newt-agent is Apache-2.0: [Gilamonster Foundation / newt-agent](https://github.com/Gilamonster-Foundation/newt-agent).*
