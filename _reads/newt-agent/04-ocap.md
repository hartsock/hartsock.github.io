---
title: How Newt grants and enforces authority
series: newt-agent
part: 4
dek: 'Every tool call runs under a capability: what it may read, write, run, and reach. The operator sets the ceiling, the gate checks each call, and the kernel enforces it where the OS allows. Step through one write that is allowed and one network call that is not.'
read_time: ~5 min
permalink: /series/newt-agent/ocap/
wide: true
extra_css:
- /assets/css/newt.css
newt_demo: ocap
authors:
- name: Shawn Hartsock
  role: commissioned
ai: drafted
status: draft
revisions:
- date: '2026-10-22'
  by: claude-sonnet-5-5
  note: Moved from newt-agent site/ocap.html at 67b24697; prose converted to Markdown, animation text moved to copy.
copy:
  newt:
    fine: 'Example paths and hosts are illustrative. Types come from `newt-core/src/caveats.rs` and `newt-core/src/agentic/permissions.rs`. Keys: left/right arrows step, space plays or pauses.'
    nodes_0_label: Operator
    nodes_1_label: Session grant
    nodes_1_sub: 'Caveats: fs_write ~/proj, net none'
    nodes_2_label: approve.toml
    nodes_2_sub: signed durable grants
    nodes_3_label: Model
    nodes_4_label: Permission gate
    nodes_4_sub: fs_read, fs_write, exec, net
    nodes_5_label: agent-bridle
    nodes_5_sub: Landlock, Seatbelt, AppContainer
    nodes_6_label: Sub-agent key
    nodes_6_sub: delegated authority
    nodes_7_label: api.example.com
    nodes_8_label: ~/proj/src/a.rs
    stages_0_title: The operator sets the ceiling
    stages_0_cap: At launch the operator picks what the session may touch, for example --workspace-access code ~/proj. The grant is resolved once and frozen for the session. Network is off unless granted.
    stages_0_note: 'Implemented: launch_authority.rs'
    stages_1_title: A call inside the grant passes
    stages_1_cap: The model asks to write a file under the project. The gate checks the call against the grant on each axis (read, write, exec, net). The path is inside fs_write, so it proceeds.
    stages_1_note: 'Implemented: CaveatsExt::permits_fs_write'
    stages_2_title: A call outside the grant is denied
    stages_2_cap: Now the model tries to reach a host that is not granted. The check fails and the gate returns a typed denial, here DenialKind::Net. Nothing was sent.
    stages_2_tag_gate: DenialKind::Net
    stages_2_note: 'Implemented: PermissionDecision::Deny'
    stages_3_title: The operator can widen by one target
    stages_3_cap: The gate asks. If the operator allows it, widen_caveats adds exactly that one host to one axis for the re-run of this call. Operator approval widens. It is delegation that only narrows.
    stages_3_tag_grant: one host added, this call only
    stages_3_note: 'Implemented: widen_caveats'
    stages_4_title: Always-allow is saved and signed
    stages_4_cap: If the operator picks always-allow, the grant is written to approve.toml with an Ed25519 signature from the operator root key. Unsigned or tampered approvals are dropped and the gate asks again. Deny, ask and passkey files can only narrow, so they load unsigned.
    stages_4_note: 'Implemented: ocap_store.rs'
    stages_5_title: The kernel enforces what the gate decided
    stages_5_cap: An allowed command runs in a confined child. The resolved caveats go to agent-bridle as an ExecRequest. The filesystem fence is Landlock on Linux and Seatbelt on macOS; Windows uses AppContainer. If the host cannot enforce the fence, the spawn is refused rather than run unconfined.
    stages_5_tag_bridle: fail-closed
    stages_5_note: Implemented, with open platform deviations (see table)
    stages_6_title: Delegated authority only shrinks
    stages_6_cap: When a sub-agent gets its own key, its caveats are combined with meet against its parent. A child that tries to widen is refused. The lattice laws are machine-checked in Lean.
    stages_6_note: 'Implemented: meet + formal/CaveatLattice'
    stages_0_edges_0_2: --workspace-access
    stages_1_edges_0_2: write_file
    stages_1_edges_1_2: checked against
    stages_1_edges_2_2: permits_fs_write
    stages_2_edges_0_2: curl api.example.com
    stages_2_edges_1_2: checked against
    stages_2_edges_2_2: permits_net
    stages_3_edges_0_2: allow once?
    stages_3_edges_1_2: Allow(+1 host)
    stages_3_edges_2_2: re-run
    stages_4_edges_0_2: sign (Ed25519)
    stages_4_edges_1_2: 'precedence: deny > passkey > ask > approve'
    stages_5_edges_0_2: ExecRequest(Caveats)
    stages_5_edges_1_2: kernel fence
    stages_6_edges_0_2: 'meet(): can only narrow'
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

[**The brush shell**](/series/newt-agent/brush/): how a shell command becomes individually checked spawns, and why.

## What each stage maps to

| Stage | What it does | Where | Status |
|---|---|---|---|
| Ceiling | Operator picks workspace access once; frozen for the session. | [`newt-core/src/launch_authority.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/launch_authority.rs) | Implemented |
| Check | Each call is tested on fs_read, fs_write, exec and net. | [`newt-core/src/caveats.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/caveats.rs) | Implemented |
| Deny and ask | Typed denial (DenialKind), then the gate asks the operator. | [`newt-core/src/agentic/permissions.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/agentic/permissions.rs) | Implemented |
| Widen once | widen_caveats adds one target to one axis for one re-run. | [`newt-core/src/agentic/permissions.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/agentic/permissions.rs) | Implemented |
| Durable grants | Signed approve.toml; four verdict files; unsigned approvals are dropped. | [`newt-core/src/ocap_store.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/ocap_store.rs) | Implemented |
| Kernel fence | Confined child via agent-bridle; refuses if it cannot enforce. | [`newt-core/src/confined_exec.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/confined_exec.rs) | Implemented, open deviations |
| Delegation | meet only narrows; Lean proofs cover the lattice, not the whole runtime. | [`formal/CaveatLattice/`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/formal/CaveatLattice/) | Implemented |
| Grant tree view | A per-host, per-path grant tree is a pure view, not wired in. | [`newt-core/src/grant_tree.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/grant_tree.rs) | Design only |

## What this does not show

- On macOS, deny-all network is supported for audited launches by an unprivileged caller with pipe or null stdio. Hostname-scoped and deputy-relayed network grants are not enforceable there and are refused, so a per-host network fence is not shown.
- Windows AppContainer does not enforce a restricted exec allowlist; it fails closed and refuses the shell tool.
- `--yolo` (`--disable-ocap`) runs on the host shell with no confinement.
- Signatures do not stop an older valid file being restored, and do not help if an attacker holds the operator key.
- Open deviations are tracked in [docs/security/ocap-deviations.md](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/security/ocap-deviations.md).

*Source: newt-agent `site/ocap.html` at `67b24697`. newt-agent is Apache-2.0: [Gilamonster Foundation / newt-agent](https://github.com/Gilamonster-Foundation/newt-agent).*
