---
title: "What We Did Not Prove"
series: reconstitution-thesis
part: 6
dek: "The assumptions under the proofs, the two obligations still open, and what you can check yourself."
read_time: "~5 min"
permalink: /series/reconstitution-thesis/what-we-did-not-prove/
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
A proof is as good as its premises, and a short list of claims is more useful than a long list of reassurances. Here is the account.

## What is proved

Five obligations are settled. PO-R-1, the retraction, and PO-R-2, the keyword round trip, and PO-R-3, the necessity of the witness, are theorems in Lean. PO-R-4, kill-authority safety, passes in TLC. PO-R-B, the boundary where it breaks, is demonstrated by a TLC run that fails as designed.

## What is assumed

Three premises sit underneath all of it, and none of them is proved here.

- **Content addresses are injective.** Distinct bytes get distinct addresses. This is how the model can say "byte-exact" by comparing addresses.
- **The hash is hard to collide.** The cryptographic strength that makes the first premise true in practice is taken as given.
- **Actions are deterministic.** Perforce archive and print, and the projection steps, are treated as functions of their inputs, so a file at a changelist has a single true form. That is what makes reconstitution a function and not a relation.

## What is open

Two obligations are stated and not yet formalized.

- **PO-R-5, charset fidelity.** A binary file should never reconstitute with a text head type. The model does not yet have the type lattice to say this.
- **PO-R-6, multi-frame reconstitution.** A depot rebuilt from several projected frames should match the source at every intermediate changelist, not only at the head. The model so far covers a single frame.

Beyond the table, the two models are small. The Lean model tracks a file as a path, bytes and a three-valued type, and the keyword model as a list of tokens. The TLA+ model has three files. They justify the design. They do not certify the code, and the end-to-end test is the check that does.

The optimality bound from the second read carries its own caveat. The bound holds for the scheme. The shipped encoder stores the full original rather than a minimal index, and no conditional entropy has been measured on a real corpus.

## Why the gate runs in CI only

The formal check needs a Lean toolchain, a Java runtime and the TLA+ tools. That is too heavy to run on every push, so the project runs it as a continuous integration job on every change that touches the formal directory, and lists it in the push hook as deliberately not mirrored. A gate that is slow to run locally gets routed around. The cost is that a local push does not run it. Run the formal check by hand before touching those files.

## What you can check yourself

You do not have to take any of this on trust, and you do not need our tools to start.

1. Read the Lean statements. The retraction is one line: reconstituting a file projected with its witness returns the file. The keyword facts are a handful of short lemmas in Lean core, with no outside libraries. The development also prints the axioms each theorem uses, so you can see that none depends on an unproved placeholder.
2. Model the boundary yourself. The TLA+ model has one switch. Write the three-file version, flip the switch, and watch the faithfulness check fail.
3. Hold any tool to the end-to-end case, ours included: seed a depot with a text file, a binary file and a keyword file, project to Git with the notes written into the target, destroy the depot, rebuild from the Git repository alone, and compare content and type.
4. Break a premise. Pick one assumption above, find a case where it would fail in your environment, and tell us. The open obligations are the most useful place to push.

The point of all of this is preservation and provenance: data that crosses a lossy boundary arrives with nothing lost and with a record, in the copy, of where it came from. Rebuilding a dead server was only ever the test of that. It is a claim you are allowed to attack. We have shown where it holds, where it breaks when a step is removed, and where we have not looked yet.
