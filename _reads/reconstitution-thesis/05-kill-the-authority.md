---
title: "Kill the Authority"
series: reconstitution-thesis
part: 5
dek: "A model where the depot is destroyed and rebuilt from the Git view alone, and the setting where it breaks."
read_time: "~5 min"
permalink: /series/reconstitution-thesis/kill-the-authority/
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
- date: '2026-10-28'
  by: claude-sonnet-5-5
  note: Opens with the plain claim and its exact evidence.
sitemap: false
---
You can reconstitute a Perforce depot from the Git copy alone, and kyln does it. The end-to-end test seeds a depot with a text file, a binary file and a keyword file, projects it to Git with witnesses written into the target, obliterates the depot, rebuilds a fresh one from the Git repository alone, and compares content and type. The rebuilt depot matches the source: the text and binary files byte for byte at the right type, and the keyword file at full type with its archive-exact form. The test runs as a gate in continuous integration against a live Perforce server, and it passes. This is the counterexample to the prior art, which says that information inevitably gets lost, and it is why the claim is bold. The model and the algebra below explain why it holds. Two obligations remain open, and part 6 lists them.

The strongest way to show nothing was lost is to destroy the original and recover it from the copy alone. This is the project's acid test. The Lean proofs show that recovery works for a file when the note is present. The acid test asks for more: a whole depot destroyed and recovered. That is a statement about a sequence of events, so the project checks it with a different tool, TLA+ and its model checker TLC.

## The model

The model has a source authority, standing in for the Perforce depot, seeded with three files: a plain text file, a binary file, and a `text+k` keyword file. One engine process does three things in order.

1. **Project.** For each file, copy its content into the Git view and record the file's type as a provenance note carried in that view. Plain and binary files carry their type intrinsically. The keyword file is the lossy one, and its note is what recovery needs.
2. **Obliterate.** Destroy the source authority.
3. **Reconstitute.** Build a fresh authority from the Git view only. This step is never allowed to read the source. A separate ghost copy of the original files exists in the model solely so the invariant can grade the result, and the rebuild does not touch it.

The property checked is called `ReconstitutionFaithful`: once the rebuild is complete, every rebuilt file equals its original in content and in type. The keyword file has to come back as a keyword file, not as plain text. TLC explores every order in which the files could be projected and rebuilt, and reports whether the property ever fails.

On the main model it does not fail. After the authority is killed, the Git view is enough to reproduce all three files. That is the proof obligation PO-R-4, and it is checked.

![Animation: a source depot with a text file, a binary file and a keyword file is projected into a Git view that carries a type note for each; the depot is then destroyed, and a new depot is rebuilt from the Git view alone, with all three files matching the originals.](/assets/series/reconstitution-thesis/proof-kill-authority.gif)

## The run where it breaks

A model that cannot fail proves little, so the project keeps a second configuration. A single constant, `WitnessLossyOps`, decides whether the keyword file's type is recorded into the Git view. Everything else is identical. With it true, the main model passes. With it false, the keyword file is projected with no note, and when the rebuild runs it can only fall back to plain text. TLC reports that `ReconstitutionFaithful` is violated, with a trace that ends in a rebuilt file of the wrong type.

This is the boundary run, the proof obligation PO-R-B, and the project counts it as demonstrated. It shows that recording the witness is what makes the guarantee hold, since removing that one step is enough to break it. The failing check is expected, and the project's single check script treats a failure of the boundary model as the correct outcome and a pass as an error.

![Animation: the same destroy-and-rebuild run with the type note for the keyword file left out of the Git view; the rebuilt depot has the keyword file's bytes but the wrong type, and the faithfulness check fails.](/assets/series/reconstitution-thesis/proof-boundary.gif)

## What this does and does not show

TLC checks a small, closed model. It tells you that in that model, for every ordering, the rebuilt files match. It does not read a real depot. The project pairs it with an end-to-end test that does run against a real server: seed a depot with the three kinds of file, project to Git while writing the notes into the target, obliterate the depot, rebuild a fresh one from the Git repository alone, and compare. The model explains why that test should pass. The test shows that the code does.

The last read lists what both of them leave out.
