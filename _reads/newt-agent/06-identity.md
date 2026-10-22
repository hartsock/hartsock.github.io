---
title: How Newt tracks who is acting
series: newt-agent
part: 6
dek: Two separate things carry identity. A key chain decides what a session may do. A ledger decides who is credited on a commit. They are not the same mechanism, and the animation keeps them apart.
read_time: ~5 min
permalink: /series/newt-agent/identity/
wide: true
extra_css:
- /assets/css/newt.css
newt_demo: identity
authors:
- name: Shawn Hartsock
  role: commissioned
ai: drafted
status: draft
revisions:
- date: '2026-10-22'
  by: claude-sonnet-5-5
  note: Moved from newt-agent site/identity.html at 67b24697; prose converted to Markdown, animation text moved to copy.
copy:
  newt:
    fine: 'Names and versions are placeholders. Types come from `newt-identity/` and `newt-core/src/attribution.rs`. Keys: left/right arrows step, space plays or pauses.'
    nodes_0_label: UserKey
    nodes_0_sub: Ed25519, ~/.newt/identity.pem
    nodes_1_label: AgentKey
    nodes_1_sub: session_root, attenuate()
    nodes_2_label: AgentIdentity
    nodes_2_sub: agent-identity.toml, default newt-agent
    nodes_3_label: Operator
    nodes_3_sub: git user.name + user.email
    nodes_4_label: AttributionLedger
    nodes_4_sub: ordered, deduplicated
    nodes_5_label: Commit
    nodes_5_sub: trailers
    nodes_6_label: /byline
    nodes_6_sub: preview
    nodes_7_label: Signer
    nodes_7_sub: optional, off by default
    stages_0_title: The operator key is the root of trust
    stages_0_cap: On first run Newt makes a per-user Ed25519 key with mode 0600. Everything about tool authority chains back to it.
    stages_0_note: 'Implemented: newt-identity'
    stages_1_title: The session gets a narrower key
    stages_1_cap: The session root is an AgentKey, and attenuate() mints an operating key whose signed caveats can only shrink. This chain gates tool authority. It does not feed commit trailers.
    stages_1_note: 'Implemented: newt-identity'
    stages_2_title: The commit identity is resolved
    stages_2_cap: Separately, AgentIdentity is resolved from workspace, then user, then system config, then the built-in default (the newt-agent account with a noreply address). The file holds references, never key material.
    stages_2_note: 'Implemented: agent_identity.rs'
    stages_3_title: The human is read from git
    stages_3_cap: The operator's name and email come from git config as a matched pair. If either is missing, no operator line is written. An email is never invented.
    stages_3_note: 'Implemented: host_operator_identity'
    stages_4_title: Every contributor is recorded
    stages_4_cap: As work lands, the runtime records each model and harness, with version and build. Switch models mid-session and both stay credited. Order is kept and duplicates are dropped.
    stages_4_tag_led: Model A, then /model, Model B
    stages_4_note: 'Implemented: AttributionLedger'
    stages_5_title: Preview, then stamp
    stages_5_cap: /byline runs the same finalizer a commit runs, so the preview matches. The commit gets one Co-authored-by per contributor, the operator line, and a Harness line. The ledger cursor then advances so the next commit does not re-credit.
    stages_5_note: 'Implemented: finalize_message_with'
    stages_6_title: Signing is optional
    stages_6_cap: Commit signing is off by default. In Harness mode the harness signs in-process, outside the sandbox, so the model cannot read the key. In Operator mode it uses the operator's own git signing setup.
    stages_6_note: 'Implemented, off by default: commit_signing.rs'
    stages_1_edges_0_2: 'attenuate: only narrower'
    stages_3_edges_0_2: name + email pair
    stages_4_edges_0_2: harness + version
    stages_5_edges_0_2: same finalizer
    stages_5_edges_1_2: Co-authored-by x N
    stages_5_edges_2_2: operator line
    stages_6_edges_0_2: SSHSIG
    back: Back
    play: Play
    pause: Pause
    next: Next
    jump: Jump to step
    step_of: Step {i} of {n}
    step_label: 'Step {i}: {title}'
---
{widget newt-demo}

## What each stage maps to

| Stage | What it does | Where | Status |
|---|---|---|---|
| Operator key | Per-user UserKey generated on first run. | [`newt-identity/src/lib.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-identity/src/lib.rs) | Implemented |
| Session key | session_root and attenuate; widening is refused. | [`newt-identity/src/delegation.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-identity/src/delegation.rs) | Implemented |
| Commit identity | Layered config resolution with a built-in default. | [`newt-core/src/agent_identity.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/agent_identity.rs) | Implemented |
| Operator by-line | From git config, only as a matched pair. | [`newt-core/src/agent_identity.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/agent_identity.rs) | Implemented |
| Ledger | Ordered, deduplicated contributors. | [`newt-core/src/attribution.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/attribution.rs) | Implemented |
| Byline and commit | One finalizer for preview and commit. | [`newt-git/src/lib.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-git/src/lib.rs) | Implemented |
| Signing | Off, Harness or Operator. | [`newt-core/src/commit_signing.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/commit_signing.rs) | Implemented, off by default |

## What this does not show

- Trailers are plain text. They come from runtime state, not from a signature by each model, so they are not proof of authorship.
- Models are not individually authenticated. The model name is the configured backend. Newt's own contributions default to its configured harness address; contributors from other harnesses keep their own.
- The key chain gates tool authority. Showing a key signing a trailer would be inaccurate.
- Mesh peers are not credited on commits.

*Source: newt-agent `site/identity.html` at `67b24697`. newt-agent is Apache-2.0: [Gilamonster Foundation / newt-agent](https://github.com/Gilamonster-Foundation/newt-agent).*
