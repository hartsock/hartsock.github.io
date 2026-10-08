---
title: Out-group review
topics: [ai-agents, review, human-oversight]
description: "In an agentic workflow, the reviewer should come from a different model family than the author. The evidence is mixed, so measure your pairing."
authors:
  - {name: Shawn Hartsock, role: commissioned}
  - {name: Claude, model: claude-sonnet-5-5, harness: Claude Code, role: drafted}
ai: drafted
status: draft
revisions:
  - {date: 2026-10-02, by: claude-sonnet-5-5, note: "First draft."}
  - {date: 2026-10-02, by: claude-sonnet-5-5, note: "Added by-line, status and revisions; removed the in-page title now rendered by the layout."}
  - {date: 2026-10-02, by: claude-sonnet-5-5, note: "Moved into the blog; URL now carries a stable id suffix."}
id: bafyr4iddeif5tmxlhqj7gvhoqba6vpwzocdry2be6yg66c5idaztjljjq4
permalink: /posts/out-group-review-ztjljjq4/
---
**In an agentic workflow, the reviewer should come from a different model family than the author.**

Models, like people, have in-group biases. An out-group member can spot what the
group cannot. I treat that as a survival mechanism, not a nicety. The evidence
supports the idea, with one caveat I will get to, and the caveat matters more
than the idea.

## Why diversity survives

Diversity of opinion is an evolutionary advantage in humans. It makes responses
vary, and variability lets a group survive a black swan that a uniform group
would all miss in the same way.

Human studies show this is conditional. An evolutionary simulation by
[Stolle et al. (2024)](https://www.cambridge.org/core/journals/judgment-and-decision-making/article/impact-of-diversity-on-group-decisionmaking-in-the-face-of-the-freerider-problem/02B7B63EE0D966045002FB18D7443E42)
found that diversity in cognitive style and information sources generally
increased cooperation. Diversity in ability had no robust effect. The results
depended on costs, available alternatives, and cue structure. So the claim is
not "more variety is better." It is that the right kind of variety, in the right
context, buys resilience.

## Models favor themselves

[Pombal, Rei and Martins](https://arxiv.org/abs/2604.06996) studied
self-preference bias in LLM judges. On objective rubrics, a judge was more than
50% more likely to wrongly mark a criterion as satisfied when it was rating its
own output. On subjective benchmarks the bias moved scores by up to 10 points.
An ensemble of judges reduced the bias but did not remove it.

That is the in-group effect in a model. An author and a reviewer from one family
share training data, habits, and blind spots. The reviewer is predisposed to
find the author's work reasonable.

## Review is a selection function

Code review works like an evolutionary algorithm. A change that reaches merge
has survived several selectors: the tests, the push hooks, CI, the reviewer's
verdict, and the operator's yes. Each filters out a different kind of defect.

Reviewers from different families are different selectors, not redundant
copies of one. Two reviewers with the same blind spot are one selector.
[CodeEvolve](https://arxiv.org/abs/2510.14150) frames LLM-driven code search in
these terms: island-based evolution over ensembles of models, balancing
exploration against exploitation.

## The caveat

[Xiang et al.](https://arxiv.org/abs/2607.21656) tested exactly this question
across 116 tasks. The result was asymmetric. Claude reviewing Codex drafts raised
the pass rate from 71.6% to 89.7%. The reverse pairing made things worse: Codex
reviewing Claude lowered pass rates.

I run the pairing that paper found harmful: Claude as author, Codex as
reviewer. So I will not cite that paper as support for "any cross-family review
helps." It does not say that. Two papers support two different claims:

- Pombal et al. support the claim that an out-group reviewer avoids
  self-preference.
- Xiang et al. show that which family reviews which can matter, in both
  directions.

My setting differs from theirs, and that cuts both ways. They measured pass
rates after a draft absorbed the reviewer's feedback, with particular models and
versions. My reviewer issues a merge or fix-first verdict on security and
correctness, and a separate helper makes the fix. In one recent stretch the
reviewer's fix-first findings were real defects, each confirmed by a failing
test. That is one data point on one workload. It is not a measurement of the
pairing.

The lesson is to measure your pairing instead of assuming diversity always
helps.

## How to measure a pairing

You do not need a paper's scale. Keep a record of what the reviewer flagged and
what happened next: was the finding a real defect, a false alarm, or a miss
that a later selector caught? Swap the reviewer family on a sample of changes
and compare. If the out-group reviewer finds defects the in-group one waved
through, and its false alarms stay tolerable, the pairing earns its cost. If
not, change the pairing. The measurement is cheap compared with the confidence
a wrong assumption buys you.

## How I lay it out

I keep three roles apart:

- **Shepherd.** Holds the plan, briefs the others, and owns the result.
- **Out-group reviewer.** A different model family from the shepherd, giving a
  verdict on the work. This is the role where diversity matters most.
- **Helpers.** Do bounded tasks. A diverse set is a similar idea but probably
  less critical, since the reviewer sits between their output and the merge.

The layout and the skills that encode it live in
[shepherds-pi](https://github.com/hartsock/shepherds-pi). The operator's yes
stays the last selector. Nothing here merges itself.

## What I am not claiming

I am not claiming cross-family review always helps, or that my pairing is
optimal. I am claiming that one family reviewing itself has a known bias,
that variety in selectors is worth paying for, and that the payoff has to be
measured, per pairing, on your own work.
