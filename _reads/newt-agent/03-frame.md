---
title: How agent-frame assists context
series: newt-agent
part: 3
dek: 'Newt has two ways of managing context. The default one, compaction, does not use agent-frame. The opt-in smart harness does: it records the session as content-addressed events, lets a small model propose what to keep, lets the host decide what is allowed, and renders the request from the result. Both stand on the same content-addressing crate.'
read_time: ~5 min
permalink: /series/newt-agent/frame/
wide: true
extra_css:
- /assets/css/newt.css
newt_demo: frame
authors:
- name: Shawn Hartsock
  role: commissioned
ai: drafted
status: draft
revisions:
- date: '2026-10-22'
  by: claude-sonnet-5-5
  note: Moved from newt-agent site/frame.html at 67b24697; prose converted to Markdown, animation text moved to copy.
copy:
  newt:
    fine: 'Names are from agent-frame/, agent-harness/, newt-core/src/agentic/smart_harness.rs and content_spill.rs. Smart mode is opt-in and experimental. Keys: left/right arrows step, space plays or pauses.'
    nodes_0_label: Compaction
    nodes_0_sub: default; compress.rs
    nodes_1_label: content-addressable
    nodes_1_sub: CIDv1, dag-cbor, BLAKE3
    nodes_2_label: Smart harness
    nodes_2_sub: opt-in, experimental
    nodes_3_label: Spill handle
    nodes_3_sub: SpillCid wraps a ContentId
    nodes_4_label: agent-frame
    nodes_4_sub: Event, Unit, Packet, verify
    nodes_5_label: FrameStore
    nodes_5_sub: agent-harness, on disk
    nodes_6_label: Auxiliary model
    nodes_6_sub: proposes what to keep
    nodes_7_label: Host check
    nodes_7_sub: validate_selection
    nodes_8_label: Projection
    nodes_8_sub: ordered request
    stages_0_title: Two ways to manage context
    stages_0_cap: 'The default is compaction: prune, summarize, spill (see the Context page). The smart harness is a second, opt-in mechanism: enabled with --smart-harness or a config key, and documented as experimental. They are separate code paths.'
    stages_0_note: Implemented. Smart mode is experimental
    stages_1_title: Both stand on content addressing
    stages_1_cap: 'Both name things by a hash of their content, using the same crate: a ContentId is CIDv1 over dag-cbor with BLAKE3. Same bytes, same name. That is the whole of what they share directly.'
    stages_1_note: Implemented
    stages_2_title: Compaction does not use agent-frame
    stages_2_cap: The default path stores the spilled middle under a handle, a SpillCid that wraps a ContentId, and compaction summaries cite their source turns. It reaches content addressing directly, not through agent-frame or agent-harness.
    stages_2_tag_comp: no agent-frame here
    stages_2_note: 'Implemented: content_spill.rs, compress.rs'
    stages_3_title: The smart harness records the session
    stages_3_cap: 'Here agent-frame matters. The session is recorded as events: a root for the operator''s prompt, observations for tool output, each addressed by content. agent-harness persists them in a FrameStore.'
    stages_3_tag_frame: RootEvent, Observation
    stages_3_note: Implemented
    stages_4_title: Large output becomes an addressed pointer
    stages_4_cap: A long tool result can be cut to an Elision unit that names its source and byte range. verify_unit recomputes that claim from the bytes. Only elision is minted today.
    stages_4_tag_frame: Elision, verify_unit
    stages_4_note: Implemented (elide only)
    stages_5_title: An auxiliary model proposes what to keep
    stages_5_cap: When context must be chosen, the harness shows an auxiliary model a catalog of the recorded messages and asks which to retain. The proposal is only a list of ids.
    stages_5_note: Implemented. Quality not established
    stages_6_title: The host decides what is legal
    stages_6_cap: A proposal cannot relax the rules. Every id must be a real candidate, pinned inputs and unseen results cannot be dropped, a tool call and its result stay together, and the total must fit the byte budget. Otherwise it is rejected.
    stages_6_tag_host: pinned kept; no split exchange; fits budget
    stages_6_note: 'Implemented: navigation.rs'
    stages_7_title: A projection renders the request
    stages_7_cap: 'The accepted selection becomes a Projection: an ordered list of entries that cite events. Order is stored there because a Merkle parent set cannot carry it. The request is built from it.'
    stages_7_note: 'Implemented: projection.rs'
    stages_8_title: Everything is recorded, even failures
    stages_8_cap: The navigation request, the reply, a rejected proposal, and an overflow the backend rejected are all recorded as events. That makes a context failure inspectable afterwards instead of silent.
    stages_8_note: 'Implemented: forensics'
    stages_9_title: Where this could converge
    stages_9_cap: 'The paged-context design would join these: bounded residency and recovery of evicted material by content id, using the graph this page records. That is intent only and has no implementation.'
    stages_9_note: Design only
    stages_1_edges_0_2: SpillCid
    stages_1_edges_1_2: ContentId
    stages_2_edges_0_2: spill the middle
    stages_2_edges_1_2: named by content
    stages_3_edges_0_2: events
    stages_3_edges_1_2: persist
    stages_4_edges_0_2: unit + source
    stages_5_edges_0_2: catalog of recorded messages
    stages_5_edges_1_2: 'proposal: ids'
    stages_6_edges_0_2: 'proposal: ids'
    stages_7_edges_0_2: accepted ids
    stages_7_edges_1_2: entries cite events
    stages_8_edges_0_2: request recorded
    stages_8_edges_1_2: failures recorded
    stages_9_edges_0_2: joined by a pager?
    stages_9_edges_1_2: same identity
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

The default path is on the [Context](/series/newt-agent/context/) page. The design that would join the two is on the [Paged context](/series/newt-agent/paged/) page.

## What each stage maps to

| Stage | What it does | Where | Status |
|---|---|---|---|
| Shared foundation | content-addressable: ContentId and RawContentId. | [`agent-frame/src/`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/agent-frame/src/) | Implemented |
| Compaction spill | SpillCid wraps a ContentId; summaries cite source turns. No agent-frame. | [`newt-core/src/agentic/content_spill.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/agentic/content_spill.rs) | Implemented |
| Session recording | Root and Observation events in a FrameStore. | [`agent-harness/src/session.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/agent-harness/src/session.rs) | Implemented |
| Elision and verify | Elide unit; verify_unit recomputes from bytes. | [`agent-frame/src/verify.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/agent-frame/src/verify.rs) | Implemented (elide only) |
| Context proposal | Auxiliary model proposes ids to retain. | [`newt-core/src/agentic/smart_harness.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/agentic/smart_harness.rs) | Implemented, experimental |
| Host validation | Candidate-only, pinned kept, no split exchange, byte budget. | [`agent-harness/src/navigation.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/agent-harness/src/navigation.rs) | Implemented |
| Projection | Ordered entries rendered to a request. | [`agent-harness/src/projection.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/agent-harness/src/projection.rs) | Implemented |
| Forensics | Navigation and overflow events are inspectable. | [`agent-harness/src/forensics.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/agent-harness/src/forensics.rs) | Implemented |
| Paged context | A pager serving faults from the graph. | [`docs/design/infinite-context-illusion.md`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/design/infinite-context-illusion.md) | Design only |

## What this does not show

- Compaction, the default, does not run on agent-frame. Only the smart harness does, and it is opt-in and experimental.
- Measured quality is thin: an installed 0.5B auxiliary produced no valid verdicts with the initial protocol, and an external model's 8 of 8 covers eight curated fixtures. Neither shows general quality.
- The host check guarantees legality (budget, pinned inputs, intact tool exchanges), not that the model chose the best context.
- A content id proves bytes hash to a name. It does not prove an agent may read them, and a verified elision proves provenance, not truth.
- Only elision is minted in v0. Concise and Generate exist in the type and are refused.
- A projection replays the host's request. It makes no claim about what a provider does inside.

*Source: newt-agent `site/frame.html` at `67b24697`. newt-agent is Apache-2.0: [Gilamonster Foundation / newt-agent](https://github.com/Gilamonster-Foundation/newt-agent).*
