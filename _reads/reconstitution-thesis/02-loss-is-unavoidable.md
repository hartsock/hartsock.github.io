---
title: "Loss Is Unavoidable"
series: reconstitution-thesis
part: 2
dek: "Loss is a property of the boundary, not a choice; the choice is where the lost bits go."
read_time: "~5 min"
permalink: /series/reconstitution-thesis/loss-is-unavoidable/
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
  note: Retitled from Lossy on Purpose to Loss Is Unavoidable; dek says loss belongs to the boundary and the choice is where the lost bits go.
- date: '2026-10-28'
  by: claude-sonnet-5-5
  note: Added a prior-art section citing Ken Muse, GitLab's Perforce import docs and p4-fusion; quotes and URLs checked by fetch.
sitemap: false
---
Take a file out of Perforce and put it in Git, and some things you cannot carry across unchanged. This is not a flaw in a particular tool. The two systems store different amounts of information, so a translation from the richer model to the poorer one has to merge distinct inputs into the same output.

Four examples show the shape of it.

- **Keyword expansion.** A Perforce file of type `text+k` stores `$Id$` in its archive, and `p4 print` expands it to a form that includes the path and revision. Once you hold only the expanded text, the original token is gone.
- **Case folding.** A case-insensitive target cannot hold two paths that differ only in case. Two Git paths can collapse into one.
- **Normalization.** An `é` can be one character or an `e` plus a combining accent. They look identical and differ in bytes, and a chosen normalization form erases which one the author wrote.
- **Metadata without a field.** Each side records things the other has no place to put.

Take the filename case. Map `café` and `cafè` to `cafe` and the reverse mapping is ambiguous. Going forward is a function. Going back is not, unless something else tells you which one it was.

## Prior art

Ken Muse, a Staff DevOps Architect at GitHub, reaches the same conclusion from the branch-history side in ["Why Your Perforce Branch History Is Missing in Git"](https://www.kenmuse.com/blog/why-perforce-branch-history-is-missing-in-git/) (January 8, 2026). Perforce keeps branches as first-class entities, with integration records in a server database. Git keeps a commit graph of parent-child links. Muse's point is that the missing history after a migration is not a tooling bug: "Since Git simply doesn’t have a place to store this information, it inevitably gets lost." Or, in the closing line, "it’s not missing – it never had a place to exist in Git’s model."

Muse's examples join our list of things the target has no field for: integration records, the history of how a branch was created, cherry-pick and partial-integration tracking, and Perforce views and workspaces. The loss is inherent to the two models, not to any one tool.

Tooling documents tell the same story from the practical side. GitLab's [Perforce import documentation](https://docs.gitlab.com/user/import/third_party_systems/perforce/) lists the differences between the two models, including that a Perforce branch creates an integration record in its database for every file, and points to `git-p4` for the move. Salesforce's [p4-fusion](https://github.com/salesforce/p4-fusion) is a fast converter from a depot to a Git repository.

Where Muse stops at "Git has no place for it", kyln makes the place. It creates the place in the target and writes the lost bits there, with a witness.

## Paying for the lost bits

A lossy projection is the ordinary case, and kyln does not pretend otherwise. What it does is pay for the loss explicitly instead of hiding it. Two records cover it.

- A **sidecar**, in a content-addressable format, carries exactly what the target cannot represent.
- A **witness record** states which rule was applied at each lossy boundary.

Where they live matters. The sidecar sits in the target, in a `.kyln/` directory inside the depot or inside the Git repository, so it travels with every `p4 sync` or `git clone`. Without it the operation is lossy, as it has to be. With it, a Git history projected into Perforce can be reconstituted from Perforce alone, byte for byte, by anyone, with no central service and no access to the installation that made the projection.

Some decisions have no single right answer, such as whether a given path should be a symlink on the target. Kyln does not guess. By default it refuses, and it asks the team to commit an explicit transform rule, a readable and versioned record kept beside the data it governs. The team argues the question once, and every later projection and reconstitution replays the rule mechanically.

## Why you cannot do better

The design is justified by a bound. The project's ADR-0027, "The Surjectivity Gap and the Witness Contract", writes the projection as a map from the richer space to the poorer one that is surjective but not injective, so its inverse is not a function on the poorer space alone. Reversing it needs extra information, the witness. The ADR then states the bound it relies on:

> Any reversible projection scheme satisfies `H(w(X)) ≥ H(X | Y)`, where `Y = π(X)`.

Read it as: the witness has to carry at least as many bits as the projection threw away, measured as the conditional entropy of the source given its projection. A scheme that stores less cannot be reversible, because two different sources would share one stored form and nothing could separate them. (ADR-0027, kyln project, Apache-2.0.)

The ADR is careful about what this does and does not say, and so should we. The bound is a statement about the scheme, and a scheme that stores the witness attains it in the limit. The code kyln ships today does not attain it. It stores the full original rather than a minimal index, and the ADR calls that a deliberate overpayment in exchange for being decodable without any other state. The ADR also records that no conditional entropy has been measured on a real corpus, and that the preliminary finding for Git into Perforce under the project's default frame is close to zero, because the gap is turned into refusals rather than stored bits. So the defensible claim is that no reversible scheme can store less than the bound, and that the design is the right shape. It is not that the current encoder is optimal.

## The first proof

The animation shows the simplest guarantee, checked in Lean. A Perforce file has bytes and a head type. Project it into a Git entry with a note recording the type, reconstitute it, and you get the original file back, bytes and type. Reconstitution is a left inverse of projection when the lossy step is witnessed. That is the proof obligation the project calls PO-R-1, and it is checked.

![Animation: a Perforce file with its bytes and head type is projected into a Git entry together with a note recording the type, then reconstituted, and the rebuilt file is identical to the original in bytes and type.](/assets/series/reconstitution-thesis/proof-retraction.gif)

The model is small on purpose. It tracks a path, some bytes and a three-valued type. It says nothing yet about a whole depot, and the later reads say what it adds and what it leaves out.
