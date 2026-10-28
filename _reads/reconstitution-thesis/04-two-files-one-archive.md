---
title: "Two Files, One Archive"
series: reconstitution-thesis
part: 4
dek: "Distinct inputs that look the same on the other side, and the only way back."
read_time: "~5 min"
permalink: /series/reconstitution-thesis/two-files-one-archive/
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
published: false
---
A function that maps different inputs to the same output is not injective. Projection between source control systems is such a function. That is the whole problem in one sentence, and this read looks at why it forces a design.

Start with the smallest example from the keyword model. Two live forms of a file, one with the keyword printed against changelist 1 and one against changelist 2, are different. Contract both and you get the same archive form with the bare keyword. The archive holds one thing, and two different files could have produced it.

The Lean development states this as `contract_not_injective`: there exist two distinct token lists that contract to the same list. It is the proof obligation PO-R-3, and it is checked. The proof names two concrete streams, and the checker confirms they differ while their archive forms agree.

The consequence is not subtle. Given only the archive form, the question "which changelist should this print against?" has no answer. Any code that guessed would be inventing data. A reconstitution that rebuilt the live form without being told would be wrong for some inputs, and it would be wrong silently.

## The witness as the only way back

The same shape appears wherever the target is poorer than the source. The case of `café` and `cafè` mapping to `cafe` is another pair of different inputs with one output. So is the combining accent. The inverse is not a function on the target alone, so something extra has to select which source was meant.

That extra thing is the witness. ADR-0027 puts it this way: pair every projection with a witness function so that the projection together with the witness is injective. Then the inverse is well defined on the stored pair. The witness is stored, not derived on demand, so that the inverse is a function of the materialized data and not of kyln's internal state.

![Animation: two different live versions of a file, one printed against changelist 1 and one against changelist 2, contract to the same archive form, so the archive alone cannot tell them apart; attaching the recorded changelist separates them again.](/assets/series/reconstitution-thesis/proof-witness-necessity.gif)

## The boundary in Lean

The same development includes the opposite case as a theorem, `unwitnessed_loses_type`. If the type note is not recorded, reconstitution recovers the bytes but has to fall back to a default head type. The example in the proof is a binary file that comes back as plain text. The bytes are intact and the file is still wrong.

This is why "provenance lands in the target" is a law and not a preference. If the note is missing when the rebuild runs, the retraction from the first proof fails, and nothing in the Git blobs can repair it.

Read the two results together. Witnessing is necessary, because the archive form alone cannot decide between inputs. And it is sufficient, in the model, because with the note the round trip returns the original. The next read asks whether that survives the loss of the server.
