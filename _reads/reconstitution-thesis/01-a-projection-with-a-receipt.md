---
title: "A Projection with a Receipt"
series: reconstitution-thesis
part: 1
dek: "A copy that carries its own receipt, so the original is recoverable from the copy alone."
read_time: "~5 min"
permalink: /series/reconstitution-thesis/a-projection-with-a-receipt/
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
  note: Restored the cutover-weekend paragraph verbatim as the hinge of the part, per editor steer.
- date: '2026-10-28'
  by: claude-sonnet-5-5
  note: Opens on the author's frame that the SCM system is an artifact and a shadow, not the source of truth.
- date: '2026-10-28'
  by: claude-sonnet-5-5
  note: Added the January diagram as the opening image and two more of the author's sentences.
- date: '2026-10-28'
  by: claude-sonnet-5-5
  note: Diagram alt text and framing now say the cloud is the real process, forced to conform to the surfaces of the tools.
- date: '2026-10-28'
  by: claude-sonnet-5-5
  note: Repositioned kyln as an attempt to be the cloud, not the line between tools; diagram alt text and caption match the new image.
- date: '2026-10-28'
  by: claude-sonnet-5-5
  note: Diagram caption and alt text now name only the four components, GitHub, GitLab, Gerrit and Perforce.
sitemap: false
---
![GitHub, GitLab, Gerrit and Perforce as nodes, each pointing into a cloud labelled the real process.](/assets/series/reconstitution-thesis/the-cloud.png)

The diagram from January: GitHub, GitLab, Gerrit and Perforce as nodes, each pointing into a cloud labelled the real process. In Shawn's words, the cloud was "SCM" or "truth" or "the real process" that was forced to conform to the surfaces of these tools.

Kyln is an attempt to be that cloud: the record of the real process itself, which the tools are shadows of. In Shawn's words: "I invented kyln to be 'the cloud' not the line. Kyln is _trying_ to be the cloud. But we admit it can't really be." What it can do is lose nothing and prove it.

The system that holds your history is not the point. The history is, and the knowledge in it: why a change was made, what was tried, who decided. Perforce, Git, any source control system is an artifact that records those decisions. In the words of the series author, Shawn Hartsock: "The problem is we design these systems as if they are the source of truth. They are NOT. They are all shadows ... projections ... of the events happening in MINDS. These are all pale shadows. Pale imitations of the real mechanics of minds negotiating with reality."

The tools force the real process to conform to their surfaces, and what each one keeps is only that conformed shape. If that is true, a move from one system to another is a translation between two shadows, and the question that matters is whether anything was lost in it. Could you get the original back from a copy? Usually the answer is "mostly", or "if the tool is still around". Kyln aims for a stricter answer: the original is a function of the copy plus its receipt, and anyone holding the copy can compute it. The projection engine and the receipt are how it keeps its record honest across the tools; they are not what it is.

## A projection loses bits

A projection is a shadow on a wall. Hold an object in front of a light and the shadow is a faithful outline, bent by the surface it lands on. Project a Perforce depot into Git and the result is a real repository that developers clone and branch. It is also a shadow, and a shadow has less in it than the object. Step back one more and the depot is a shadow too, of the decisions people made. The system is the friction between one shadow and the next.

The loss is not a defect of any tool. The two systems store different amounts of information. A keyword-expanding file type, a case-insensitive path rule, a choice of Unicode normalization, a metadata field with no counterpart: each merges inputs that were distinct. Going forward is a function. Going back is not, unless something else says which input it was.

## The usual answer

A system treated as the source of truth makes every move a risk to the original. A system treated as one projection among several makes the move a translation with a receipt. The usual practice follows the first view.

Picture a team whose history lives in Perforce while the world around it moves to Git. New tools expect Git, new hires know it, and review bots and coding agents all want a repository they can clone.

The usual answer is a cutover weekend. Freeze the depot, convert it, point everyone at the new home, and hope. Nobody can afford that for a depot that is still the system of record, and a conversion that goes wrong cannot be undone, because the thing it destroyed was the original.

## What preserved means

Kyln keeps its record honest by making sure a move never puts the original at risk. It pays for the loss in the open. Whatever the target cannot represent is written into the target as a sidecar record, in a content-addressable format. A witness record states which rule was applied at each lossy boundary. Identity is derived from content, so a record cannot drift from the data it describes, and the receipt travels with every clone and sync.

That gives a definition you can test. Data is preserved across a projection when the original can be recovered from the copy and its receipt alone. Nothing else is consulted: not a kyln database, not the machine that made the copy. Anyone can check it, because everything needed is in what they hold.

The strongest form of the test is brutal on purpose. Destroy the original and rebuild it from the copy. The project states it as one sentence:

> If P4D dies, the git copy reconstitutes it as if nothing happened.

P4D is the Perforce server. The sentence is a consequence of getting the preservation right, not the purpose. If you can rebuild from the copy alone, nothing was lost. The rest of the series takes the claim apart and says which parts are proved and which are not.

## Why that makes a move undoable

Because the data crosses with nothing lost, and with the receipt that lets anyone get back, a move between systems stops being a one-way door. The original stays intact and authoritative while the copy is used, tried and trusted. At any moment exactly one side is the authority and the other is derived, and changing direction is a declared governance decision, not a runtime toggle. A team can move when it is ready, and if it must, it can get back. A dead server is just the hardest test of this.

The animations follow one piece of data through each flow: orange starts in Git, blue in Perforce, purple is kyln or a shared store. Each caption says whether the flow ships.

![Animation: on git push, git-elfs writes large files to S3 under a sha256 key; a p4d archive trigger writes Perforce large files to the same bucket and keeps a pointer in the depot; both sides read the same object back with a hash check.](/assets/series/reconstitution-thesis/shared-bucket.gif)

One shared bucket serves both systems; the Git side ships, the Perforce trigger is not yet packaged.

![Animation: piv clone projects a Perforce view into Git. A developer branches, piv shelve creates a shelved changelist for Swarm review, piv submit projects the branch into the depot, and piv pull brings the changelist back, linked to the developer's commits by provenance.](/assets/series/reconstitution-thesis/git-piv.gif)

Work in Git against a Perforce view; Perforce stays the authority. Ships.

![Animation: fs-export reads a changelist, enforces export control, resolves LFS pointers and writes plain files to an NFS volume. A separate step snapshots and clones the volume for CI. An S3 upload lets fs-materialize rebuild the tree without Perforce.](/assets/series/reconstitution-thesis/fs-export.gif)

A changelist as plain files for builds, rejected whole if any file is denied. Ships.

![Animation in four stages: P4 is the authority and kyln projects it into Git; Git users merge in Git and each merge is written through to P4; an epoch flip makes Git the authority while P4 users sync a read-only view; the P4 leg is retired when nothing reads it.](/assets/series/reconstitution-thesis/migration.gif)

Four epochs, one authority at a time. A recommended path, not one command.

![Animation: the server receives full blobs; an offload job copies large blobs to the store and writes a manifest before repacking them away as a promisor pack. A filtered clone fetches missing blobs from the store through git-remote-kyln.](/assets/series/reconstitution-thesis/promisor.gif)

Large blobs offloaded to a store and fetched on demand. Proposed.

![Animation: Gerrit keeps every blob; clients take a filtered clone and lazy-fetch skipped blobs from Gerrit itself, the normal mode. With a store, an offload job copies large blobs out and repacks them away, and JGit's resolver reads a blob back on demand, installing it only if the SHA-1 matches; clients are unchanged.](/assets/series/reconstitution-thesis/gerrit-modes.gif)

Gerrit alone, then with a store behind it. The store variant is under review.

![Animation: kyln projects Perforce changelists into Gerrit's repository and lists large files as promised. On a review, JGit asks an application-supplied resolver, which reads the blob from S3 or prints the depot revision. JGit installs the bytes only if the SHA-1 matches. Merges are projected back to Perforce.](/assets/series/reconstitution-thesis/gerrit-p4.gif)

Gerrit and Perforce through promised objects. A design sketch.

The next read is about the boundary all of these cross.
