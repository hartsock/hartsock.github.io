---
title: How Newt runs shell commands with brush
series: newt-agent
part: 5
dek: Models write shell.
read_time: ~5 min
permalink: /series/newt-agent/brush/
wide: true
extra_css:
- /assets/css/newt.css
newt_demo: brush
authors:
- name: Shawn Hartsock
  role: commissioned
ai: drafted
status: draft
revisions:
- date: '2026-10-22'
  by: claude-sonnet-5-5
  note: Moved from newt-agent site/brush.html at 67b24697; prose converted to Markdown, animation text moved to copy.
copy:
  newt:
    fine: 'The command is illustrative. Names and paths come from `newt-core/src/config/shell.rs` and the vendored `vendor/agent-bridle-tool-shell`. Keys: left/right arrows step, space plays or pauses.'
    nodes_0_label: run_command
    nodes_0_sub: cat a | grep b && rm c
    nodes_1_label: Engine choice
    nodes_1_sub: safe-subset, host or brush
    nodes_2_label: Environment
    nodes_2_sub: starts empty
    nodes_3_label: brush worker
    nodes_3_sub: parses and runs the string
    nodes_4_label: Spawn gate
    nodes_4_sub: authorize_external_cmd
    nodes_5_label: Grant
    nodes_5_sub: 'Caveats: exec allowlist, paths'
    nodes_6_label: Kernel fence
    nodes_6_sub: Landlock or Seatbelt
    nodes_7_label: Child process
    nodes_8_label: rm
    nodes_8_sub: not on the allowlist
    stages_0_title: Why a shell at all
    stages_0_cap: A model reaches for the shell first, so Newt widens that familiar tool instead of teaching a new one. The cost is that one string can start many programs, and a host shell would run them all without Newt seeing any of them.
    stages_0_note: 'Design law: make the first instinct work'
    stages_1_title: Pick an engine
    stages_1_cap: 'There are three: safe-subset, host and brush. Confined, brush is chosen when a kernel fence is active and the worker exists on this platform, otherwise safe-subset. --full-access picks host on Linux and macOS. The confined brush worker does not exist on Windows; see the next step.'
    stages_1_tag_eng: 'confined brush: Linux and macOS'
    stages_1_note: 'Implemented: config/shell.rs, rechecked per call'
    stages_2_title: 'On Windows: a carried brush runner'
    stages_2_cap: 'The reason brush is on Windows at all is POSIX syntax there: pipelines, ; and $?, redirection and quoted paths. When OCAP is off, Windows runs commands through a separate carried runner, tools/newt-ambient-brush.exe, by default. If the runner is not installed, it falls back to cmd.exe and says so once. --windows-cmd forces cmd.'
    stages_2_tag_brush: newt-ambient-brush.exe; job-object kill-on-close
    stages_2_note: 'Implemented: docs/windows-ambient-shell.md. Not the gated worker'
    stages_3_title: Brush parses the string
    stages_3_cap: 'Brush runs in a separate, authenticated worker process and parses and interprets the string itself. That is the reason for using it: it sees each command the string would start, which a host shell keeps to itself.'
    stages_3_note: 'Implemented: brush_shell.rs'
    stages_4_title: The environment starts empty
    stages_4_cap: 'Nothing ambient is inherited. The harness passes only what a child needs: a few allowlisted variables, a seeded PATH, and any venv. PATH grants no authority, because the resolved program is still checked.'
    stages_4_note: 'Implemented: do_not_inherit_env'
    stages_5_title: Every spawn goes through the gate
    stages_5_cap: Each time brush is about to start a program, the gate checks the final resolved program and working directory against the exec allowlist in the grant. File opens that brush makes itself are checked against the read and write scopes. cat is allowed.
    stages_5_note: 'Implemented: caveat_interceptor.rs'
    stages_6_title: A denied spawn stops there
    stages_6_cap: rm is not on the allowlist, so it never starts. The gate records a typed denial and returns a permission error, and the denial appears on the result so the permission loop can ask the operator.
    stages_6_tag_gate: DenialKind::Exec
    stages_6_note: Implemented
    stages_7_title: Carried coreutils are checked too
    stages_7_cap: 'Newt bundles ls, cat, echo, head, sort and wc. They are not run inside brush: each one re-runs Newt itself as a fresh process, because forking in a multi-threaded runtime is unsafe, and that re-run passes the same gate. Brush''s own builtins, like echo, stay in-process.'
    stages_7_tag_child: ls cat head sort wc
    stages_7_note: 'Implemented: coreutils_dispatch.rs'
    stages_8_title: The kernel fence is the boundary
    stages_8_cap: 'Underneath, the worker and everything it starts inherit the OS fence. It still holds if the gate were wrong, and it covers what brush does not check: network, and the children of an admitted program (for example the commands inside find -exec).'
    stages_8_tag_gate: mediation, not the boundary
    stages_8_note: 'Implemented: Landlock, Seatbelt'
    stages_9_title: Mediation has a price
    stages_9_cap: Each spawn is an admission. A loop over N files is N spawns and N checks. Allow decisions are remembered within one invocation and denials are recomputed. No timing is claimed here, because none has been measured in the repo.
    stages_9_tag_gate: allows cached per call
    stages_9_note: 'Implemented: allow memo (B1.3)'
    stages_1_edges_0_2: which engine?
    stages_2_edges_0_2: POSIX syntax
    stages_2_edges_1_2: ambient runner
    stages_3_edges_0_2: brush engine
    stages_3_edges_1_2: string
    stages_4_edges_0_2: explicit env only
    stages_5_edges_0_2: each spawn
    stages_5_edges_1_2: check_exec
    stages_5_edges_2_2: 'cat: allowed'
    stages_6_edges_0_2: each spawn
    stages_6_edges_1_2: 'rm: denied'
    stages_7_edges_0_2: re-exec of newt
    stages_7_edges_1_2: --invoke-bundled
    stages_8_edges_0_2: inherited fence
    stages_9_edges_0_2: N spawns
    stages_9_edges_1_2: N admissions
    back: Back
    play: Play
    pause: Pause
    next: Next
    jump: Jump to step
    step_of: Step {i} of {n}
    step_label: 'Step {i}: {title}'
---
[OCAP](/series/newt-agent/ocap/) / The brush shell

Models write shell. A shell string like `cat a | grep b && rm c` hides several commands behind one call, so Newt does not hand it to the host shell. It parses it with [brush](https://github.com/reubeno/brush), a bash-compatible shell written in Rust, and checks each program the string would start against the grant. Step through how, and why.

{widget newt-demo}

## What each stage maps to

| Stage | What it does | Where | Status |
|---|---|---|---|
| Engine choice | safe-subset, host or brush; the confined brush worker needs an active fence on Linux or macOS. | [`newt-core/src/config/shell.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/config/shell.rs) | Implemented |
| Parse and run | Brush in an authenticated worker process; exec is removed from its builtins. | [`vendor/agent-bridle-tool-shell/src/brush_shell.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/vendor/agent-bridle-tool-shell/src/brush_shell.rs) | Implemented |
| Empty environment | do_not_inherit_env, explicit env seam, seeded PATH. | [`newt-core/src/agentic/tools/shell.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/agentic/tools/shell.rs) | Implemented |
| Spawn gate | Every external spawn is checked on resolved program and cwd. | [`vendor/agent-bridle-tool-shell/src/caveat_interceptor.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/vendor/agent-bridle-tool-shell/src/caveat_interceptor.rs) | Implemented |
| Open gate | Files brush opens itself are checked against fs_read and fs_write. | [`vendor/agent-bridle-tool-shell/src/caveat_interceptor.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/vendor/agent-bridle-tool-shell/src/caveat_interceptor.rs) | Implemented |
| Carried coreutils | Six uutils commands, re-executed through Newt and gated. | [`vendor/agent-bridle-tool-shell/src/coreutils_dispatch.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/vendor/agent-bridle-tool-shell/src/coreutils_dispatch.rs) | Implemented |
| Kernel fence | Inherited by the worker and descendants. | [`docs/design/captured-shell-cross-platform.md`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/design/captured-shell-cross-platform.md) | Implemented, open deviations |
| Windows ambient runner | Separate newt-ambient-brush.exe gives POSIX syntax when OCAP is off; cmd.exe fallback; kill-on-close job object. | [`docs/windows-ambient-shell.md`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/windows-ambient-shell.md) | Implemented |
| Network check in the interpreter | Network is the kernel backend's job, not brush's. | [`newt-core/src/config/shell.rs`](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/newt-core/src/config/shell.rs) | Not done by brush |

## What this does not show

- The interpreter gate is mediation and audit with exec precision. It is not an independent security boundary: the kernel fence is the boundary for files and network.
- Only spawns and opens that brush itself makes are gated. An admitted child and its descendants rely on the inherited kernel fence.
- On Windows, `--full-access` currently selects the restricted safe-subset engine, not brush, because the authenticated worker transport the brush engine needs exists only on Linux and macOS. A source branch meant to pick brush there is unreachable, and the changelog still describes it.
- On Windows, brush runs as a separate ambient runner when OCAP is off. It is not the confined, per-spawn-gated worker, which exists only on Linux and macOS. Confined on Windows, the shell engine is safe-subset, and choosing the confined brush engine there is refused.
- The confined brush worker is the default only when a kernel fence is active. Where no native fence exists, the shell can collapse to advisory, a recorded open deviation.
- Carried coreutils are not in-process. Each is a re-exec, which is also a cost.
- Newt builds on renamed `brush-ocap-*` forks published on crates.io, not on upstream brush itself. The upstream interceptor proposal (reubeno/brush#1184) is still open, and the bundled-command dispatch code is marked for upstreaming.
- No speed claim: the repo documents N admissions for N spawns but has no measurement of what that costs in time.

*Source: newt-agent `site/brush.html` at `67b24697`. newt-agent is Apache-2.0: [Gilamonster Foundation / newt-agent](https://github.com/Gilamonster-Foundation/newt-agent).*
