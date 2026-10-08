---
title: "Your Human Is an Agent Too"
date: 2026-06-18
description: "Managing several AI coding agents, and why the human sharing all of them is the bottleneck."
tags: [ai-agents, workflow, productivity]
topics: [ai-agents, human-oversight]
license: cc-by
authors:
  - {name: Shawn Hartsock, role: author}
revisions:
  - {date: 2026-10-02, by: claude-sonnet-5-5, note: "Moved from the separate blog site into this site; text unchanged."}
id: bafyr4icxwbo3x37y5lefshcu2dculim3izj4omw76z56niwfpxit75oazi
permalink: /posts/your-human-is-an-agent-too-it75oazi/
---

I manage three AI coding agents across different machines. One handles
NVIDIA work, one runs on a homelab GPU box, one lives on a personal laptop.
They all share one resource: me.

After a few weeks of this, I stopped thinking of myself as the
"orchestrator" and started treating myself as what I actually am: **another
agent in the system** — one with high authority but finite time.

That reframe changed everything.

## What Broke

A flat priority queue (P0/P1/P2) fell apart immediately. My work P0 and my
homelab P0 aren't competing for the same resources. Mixing them in one list
meant every agent saw every task, and nothing was actually prioritized.

I also discovered that AI agents will happily grind through a full work
session on a national holiday if nobody tells them to stop. (Ask me how I
know.)

## What Works

**Context-first priority lanes.** Each agent owns a context (`work/p0/`,
`homelab/p0/`). Agents stay in their lane. I scan across contexts when I
need the full picture.

**Human time budgeting.** Instead of "do these 12 things Tuesday," my
agents now say: "You need 65 minutes of communications to unblock
everything. Here's the order, prioritized by what unblocks the most
downstream work." The rest is their problem, not mine.

**Inter-agent memos.** When one agent restructures shared infrastructure, it
writes a memo — not a commit message, not a design doc — a colleague note:
"Hey Gecko, NV here. I reorganized the board. Here's what you need to do."

**Shadow mode for safe rollouts.** When replacing a production system, run
the replacement in parallel with no credentials. It receives real inputs,
logs what it *would* have done, and you compare. Confidence through data,
not faith.

## The Pattern That Matters Most

Every human interaction with another human (my manager, a teammate, a vendor
contact) is a **resource-constrained scheduling problem**. Those humans are
agents too, with their own queues. Getting on their calendar early means my
tasks unblock sooner.

My AI agents now plan my communications for me: who to contact, in what
order, through what channel, with an honest time estimate. I execute the
comms in a focused block, then hand the wheel back.

## Try This

You don't need special tooling. Markdown, YAML, symlinks, and git. The only
thing you need is a willingness to treat yourself as a participant in the
system rather than the god above it.

I wrote up the full pattern catalog: context-first lanes, task pointers,
human time budgeting, inter-agent memos, availability awareness, shadow
mode, and ethical alignment tracking. Happy to share if there's interest.

---

*Shawn Hartsock is a Staff Engineer working on SCM infrastructure. He builds
tools that treat humans and AI agents as collaborating peers.*
