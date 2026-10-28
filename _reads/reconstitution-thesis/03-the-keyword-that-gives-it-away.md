---
title: "The Keyword That Gives It Away"
series: reconstitution-thesis
part: 3
dek: "One Perforce keyword shows exactly why the archive form needs a changelist written down."
read_time: "~5 min"
permalink: /series/reconstitution-thesis/the-keyword-that-gives-it-away/
authors:
- name: Shawn Hartsock
  role: commissioned
- name: Claude
  model: claude-sonnet-5-5
  harness: Claude Code
  role: drafted
ai: drafted
status: draft
revisions:
- date: '2026-10-28'
  by: claude-sonnet-5-5
  note: First draft from the kyln README, ADR-0027, the data-flow page and the formal development; claims checked against the proof-obligation table.
- date: '2026-10-28'
  by: claude-sonnet-5-5
  note: Reframed around data preservation across a lossy boundary; the dead-server rebuild is the acid test, not the goal.
sitemap: false
---
Perforce can expand keywords in files of type `text+k`. A file stored with the bare token `$Change$` is shown by `p4 print` as `$Change: 42 $`, where 42 is the changelist the file was printed against. Two things are going on, and they are different maps.

- **Contract** takes any form to the bare one. `$Change: 42 $` and `$Change: 7 $` both become `$Change$`.
- **Expand** takes the bare form and a changelist number and produces the live one.

The depot's archive holds the contracted form. What you see in a working file or a `p4 print` is the expanded form for some changelist.

Now project that file into Git. If you copy the expanded text, you have captured one particular changelist number that was an accident of when you printed. If you copy the contracted text, you have lost the number entirely. Either way something is missing, and whichever you pick, the original token `$Change$` and the number are never both recoverable from the Git blob alone.

## What the proof says

The Lean development models a file as a list of tokens. A token is either an ordinary byte or a keyword carrying a changelist number, with zero standing for the bare form. Contract sets every keyword to zero. Expand sets every keyword to a given changelist. Three theorems follow, and all are checked.

The first is that the archive form does not depend on the print. Contracting an expanded stream gives the same result as contracting the original. What the depot stores is the same whichever changelist last printed the file. The Lean statement is `contract_expand`.

The second is that a witnessed changelist recovers the live form. Expanding the contracted archive against the recorded changelist gives back exactly what `p4 print` showed. The statements are `expand_contract` and `expand_witnessed`. The word that carries the weight is witnessed: the number has to come from somewhere.

The third says where it cannot come from. We will leave that to the next read.

Together, the first two are the proof obligation called PO-R-2. They say the round trip is exact given the recorded changelist.

![Animation: a file containing the bare keyword is expanded against changelist 42 to show the live form, then contracted back to the bare archive form, and expanding the archive again against the recorded changelist 42 reproduces the live form exactly.](/assets/series/reconstitution-thesis/proof-keyword-roundtrip.gif)

## Why a note in the target is the answer

If the changelist is needed to recover the live form, it has to be stored where anyone recovering the file can find it. Kyln lands that record, a provenance note per commit, in the Git target itself. The design law the project states is that provenance lands in the target, not kyln-side. Keeping it only in a kyln database would make the Git repository insufficient on its own, and then the thesis would be false the moment that database disappeared.

One honest detail from the end-to-end test: the changelist number that `p4 print` shows in expanded keywords is recomputed on the recovered depot rather than stored byte for byte. The project owner accepted that as a residue, since the number is a property of the new depot's history. What is restored exactly is the file type and the archive-exact contracted form.
