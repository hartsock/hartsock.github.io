---
title: How Newt sessions dock across machines
series: newt-agent
part: 7
dek: 'A hub can list, mirror and steer sessions running on another of the operator''s own machines. The session never moves: the host stays the only writer. Step through discovery, pairing, approval, mirroring, injecting and revoking.'
read_time: ~5 min
permalink: /series/newt-agent/mesh/
wide: true
extra_css:
- /assets/css/newt.css
newt_demo: mesh
authors:
- name: Shawn Hartsock
  role: commissioned
ai: drafted
status: draft
revisions:
- date: '2026-10-22'
  by: claude-sonnet-5-5
  note: Moved from newt-agent site/mesh.html at 67b24697; prose converted to Markdown, animation text moved to copy.
copy:
  newt:
    fine: 'Placeholders only. Types come from `newt-mesh/src/dock.rs`. The transport lives in the sibling agent-mesh repo, and newt-mesh is built outside the default workspace. Keys: left/right arrows step, space plays or pauses.'
    nodes_0_label: Operator root key
    nodes_0_sub: UserKey, ~/.newt/identity.pem
    nodes_1_label: Hub
    nodes_1_sub: newt-web or CLI
    nodes_2_label: Host
    nodes_2_sub: a newt session
    nodes_3_label: docks.d/peers.toml
    nodes_3_sub: signed approvals
    stages_0_title: Each machine derives its own key
    stages_0_cap: Your operator root key (the same UserKey as on the Identity page) plus a label naming the role and the machine, newt/dock/v1/host/<instance>, derive that machine's key. The instance name is random on first use, not secret, and kept in a dock-instance file you can rename. The key itself is never stored, so an approved fingerprint survives restarts. Change the instance name and the identity changes, so approvals must be re-granted.
    stages_0_tag_hub: newt/dock/v1/hub/<instance>
    stages_0_tag_host: newt/dock/v1/host/<instance>
    stages_0_note: 'Implemented: dock_agent. Same operator only'
    stages_1_title: Discover on the LAN
    stages_1_cap: The host advertises a capability tag over mDNS and the hub finds it by fingerprint, or dials a direct address. mDNS is LAN only.
    stages_1_note: Implemented (LAN)
    stages_2_title: Reach through NAT by calling out
    stages_2_cap: Off the LAN, the host dials out and keeps one long-poll open on the uplink topic. The hub answers that poll when it has a request. Delivery is at-most-once.
    stages_2_note: Implemented (interim carrier)
    stages_3_title: Pair with a code both sides compute
    stages_3_cap: The host commits, the hub replies with a nonce, the host reveals. Both compute a short numeric code. The operator runs newt dock approve --staged at the terminal and compares them.
    stages_3_tag_hub: 6-digit code
    stages_3_tag_host: 6-digit code
    stages_3_note: 'Implemented: Numeric Comparison'
    stages_4_title: Approval is a signed row, fail-closed
    stages_4_cap: 'Proving who you are does not grant access. The hub checks its own signed registry for a scope: mirror (read) or mirror-inject. No row, no dial.'
    stages_4_note: 'Implemented: dock_registry.rs'
    stages_5_title: 'Mirror: read the host''s sessions'
    stages_5_cap: The hub asks for the session list and a transcript and gets snapshots back. It is request and reply, not a live stream.
    stages_5_note: Implemented (snapshots)
    stages_6_title: 'Steer: inject a prompt'
    stages_6_cap: With mirror-inject, the hub sends a prompt. The host queues it in its own REPL. The hub never writes the remote transcript, so the host stays the sole writer.
    stages_6_tag_host: sole writer
    stages_6_note: 'Implemented: rule D2'
    stages_7_title: Revoke
    stages_7_cap: newt dock revoke, or the undock-all kill switch, bumps a generation. A live dock is dropped at its next re-check.
    stages_7_tag_reg: generation bump
    stages_7_note: Implemented
    stages_0_edges_0_2: '+ label: hub'
    stages_0_edges_1_2: '+ label: host'
    stages_1_edges_0_2: 'mDNS: newt-session'
    stages_2_edges_0_2: 'long-poll: newt/dock/uplink/v1'
    stages_2_edges_1_2: request in reply
    stages_3_edges_0_2: Commit, Reveal
    stages_4_edges_0_2: 'scope: mirror | mirror-inject'
    stages_5_edges_0_2: ListSessions, Transcript
    stages_5_edges_1_2: snapshot
    stages_6_edges_0_2: Inject{conv, text}
    stages_7_edges_0_2: dock ends
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
| Identify | Per-machine keys derived from one operator root. | [`newt-mesh/src/dock.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-mesh/src/dock.rs) | Implemented |
| Discover | mDNS capability tags on the LAN; direct pubkey@addr dial. | [`newt-mesh/src/dock.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-mesh/src/dock.rs) | Implemented (LAN) |
| Uplink | Host dials out and long-polls the hub. | [`newt-mesh/src/uplink.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-mesh/src/uplink.rs) | Implemented (interim) |
| Pair | Commit-reveal numeric comparison, approved at the terminal. | [`newt-core/src/dock_registry.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/dock_registry.rs) | Implemented |
| Authorize | Signed registry rows with a scope. | [`newt-core/src/dock_registry.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/dock_registry.rs) | Implemented |
| Mirror and inject | Snapshots and a host-queued prompt. | [`newt-mesh/src/dock.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-mesh/src/dock.rs) | Implemented |
| Delegated caveats | Attenuation is checked and handed to local plugins; the dock stage does not use caveats. | [`newt-mesh/src/caveats.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-mesh/src/caveats.rs) | Partly implemented |
| Cross-operator trust, live streaming | Different operators pairing; push mirroring. |  | Not built |

## What this does not show

- Everything is the same operator with one shared root key. Cross-operator pairing is future work.
- The six-word key mnemonic is a cross-check of a public key, not a two-party SAS.
- Nothing migrates between hosts. The hub mirrors and injects.
- Caveats do not travel with a dock request and are not enforced on the remote side.
- No TLA+ spec covers the mesh.

*Source: newt-agent `site/mesh.html` at `67b24697`. newt-agent is Apache-2.0: [Gilamonster Foundation / newt-agent](https://github.com/Gilamonster-Foundation/newt-agent).*
