---
layout: default
title: OCAP in the Age of Agents
permalink: /ocap-in-the-age-of-agents/
published: false
description: "Capabilities lose on usability, not correctness. An attempt to make them ergonomic for coding agents, with the failures left in."
---
<!-- DRAFT. published: false keeps this off the site. Remove it only after Shawn signs off.
     Placeholders marked TODO are not claims; nothing here is shown until a real recording backs it. -->

# OCAP in the Age of Agents

**Capabilities keep losing on usability, not correctness.**

Nobody says capability-based security is *wrong*. It keeps being rejected because
it is hard to use. This is an experiment in making it ergonomic for coding
agents, with the failures left in.

## The problem

An agent reads text it did not write and holds authority to act. That is a
confused deputy: a program whose authority can be steered by someone else's
input. A sandbox confines the process. A capability limits *who may ask for
what*, and can be narrowed as it is handed down.

## The hypothesis

**Designation is authorization.** When you name the folder the agent works in,
or the host it may fetch from, that act already is the grant. No second
"allow this?" prompt to click through.

We are testing whether that holds for real tasks. It may not.

## Demo

Three beats, each a real recorded run, nothing staged:

1. **Success.** A confined task finishes inside its grant. *TODO: recording.*
2. **Failure.** A run that fails, with its cause. *TODO: recording.*
3. **An exfiltration attempt, stopped.** Given a task, the agent tries to send a
   token to a host it was never granted, and the network caveat refuses it. The
   task file was written to exercise this path; the agent's choice to try was its
   own. *TODO: recording. TODO: receipt, pending
   [newt-agent #2643](https://github.com/Gilamonster-Foundation/newt-agent/issues/2643):
   this denial is not yet written to the journal.*

## What broke

Every row is a public issue or PR.

| What we tried | What broke | Where |
|---|---|---|
| Confined agent creates a git worktree | Git's own helper programs were refused | [agent-bridle #407](https://github.com/Gilamonster-Foundation/agent-bridle/pull/407), [newt-agent #2630](https://github.com/Gilamonster-Foundation/newt-agent/issues/2630) |
| Approve a denied command | The model was asked to retry instead of the command re-running with the grant | [newt-agent #2628](https://github.com/Gilamonster-Foundation/newt-agent/issues/2628) |
| Denial message | The model probed the fence because the denial did not name the axis and target | [newt-agent #2629](https://github.com/Gilamonster-Foundation/newt-agent/issues/2629) |
| Host-scoped network grant | Spawned commands did not get the narrowed grant | [newt-agent #2619](https://github.com/Gilamonster-Foundation/newt-agent/pull/2619) |

*TODO: add the measured numbers (approvals per task, denial-probing) once the recordings exist.*

## What is not claimed

- Write-fencing is not read, exec or network confinement.
- No benchmark or refactoring result is claimed until it has been witnessed.

## Where this sits

Runtime sandboxes such as [OpenShell](https://nvidianews.nvidia.com/news/open-agent-safety-platform)
enforce a boundary outside the agent. That is complementary. Capabilities add
delegation: authority that can be narrowed and handed on, never widened.
Independent designs reached the same core: [zcap](https://w3c-ccg.github.io/zcap-spec/)
and [UCAN](https://github.com/ucan-wg/spec).

## Try it

- [newt-agent](https://github.com/Gilamonster-Foundation/newt-agent), the agent harness
- [agent-bridle](https://github.com/Gilamonster-Foundation/agent-bridle), the capability layer
- [The Cruel Symmetry]({{ '/cruel-symmetry/' | relative_url }}), the idea in essay form: give the exact key, not the keyring

A personal project. Views are my own.
