---
layout: series
series: newt-agent
series_order: 3
permalink: /series/newt-agent/
title: "Newt-Agent"
tagline: "An experimental agentic coder in Rust, built for local models first."
blurb: >-
  Step-through animations of how newt-agent works: context management, paged
  context, agent-frame, OCAP grants and enforcement, the brush shell, identity,
  and the session mesh. Each page is checked against the source and says what
  is implemented and what is only design. Revised over time.
topics: [ai-agents, capability-security, software-design]
---
![Newt-Agent logo: a newt](/assets/img/newt-logo.png)

Newt is an experimental agentic coder in Rust, built for local models first. The operator grants each tool call a capability, and the grant is enforced in the kernel where the OS allows.

Each page is a step-through animation checked against the source, with a table of what is implemented and what is only design. The pages are revised as the project changes, and each names the source revision it came from.

Links: [Source](https://github.com/Gilamonster-Foundation/newt-agent), [Vision](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/vision.md), [Design laws](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/design-laws.md), [Terminal-Bench scoreboard](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/docs/terminal-bench.md), [Changelog](https://github.com/Gilamonster-Foundation/newt-agent/blob/main/CHANGELOG.md).

Try it:

```
git clone https://github.com/Gilamonster-Foundation/newt-agent
cd newt-agent
just install
newt
```

The first run opens a setup wizard. `newt --help` is the authority on what the binary does.

*Source: newt-agent `site/index.html` at `67b24697`. newt-agent is Apache-2.0.*
