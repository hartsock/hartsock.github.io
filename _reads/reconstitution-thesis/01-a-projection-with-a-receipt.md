---
title: "A Projection with a Receipt"
series: reconstitution-thesis
part: 1
dek: "A team on Perforce, a world moving to Git, and a cutover nobody can afford."
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
published: false
---
Picture a team whose history lives in Perforce. The depot holds years of changelists, the build system reads from it, and the access rules are written around it. Around that team the world has moved to Git. New tools expect it, new hires know it, and code search, review bots and coding agents all want a repository they can clone.

The usual answer is a cutover weekend. Freeze the depot, convert it, point everyone at the new home, and hope. Nobody can afford that for a depot that is still the system of record, and a conversion that goes wrong cannot be undone, because the thing it destroyed was the original.

Kyln takes a different position. It is a toolkit for wiring workflows across more than one source control system, built around a projection engine that takes a view of one system and projects it into another: Git into Perforce, Perforce into Git, Git into Git. This series is about one property of that engine, stated as a single sentence:

> If P4D dies, the git copy reconstitutes it as if nothing happened.

P4D is the Perforce server. The claim is that the Git side is not just a convenient view. Given only the Git repository, you can build a fresh depot that matches the one you lost. The receipt in this part's title is what makes that possible: every projection leaves a record of what it could not carry, stored in the target, so the copy can be traced back to what it came from. The rest of the series is about what that takes, and about which parts we have proved and which we have not.

## What a projection is

A projection is a shadow on a wall. Hold an object in front of a light and the shadow is a faithful outline of the object, bent by the surface it lands on. The Perforce depot is the object. The Git repository is the shadow. Developers can clone the shadow, branch it, and run CI against it, and they treat it as real because for their purposes it is.

The shadow is not a peer. At any moment exactly one side is the authority and the other is derived from it. Kyln does not synchronize two systems that negotiate. Direction is declared, and changing it is a governance decision made in a bounded interval called an epoch, not a toggle that flips at runtime.

That rule is what makes a gradual move possible. Perforce stays the authority and Git is a read-only view. Teams that want Git merge there, and each merge is written back to Perforce. Later a governance decision makes Git the authority, and Perforce users keep syncing a read-only view. Finally the Perforce side is retired when nothing reads it. Each team moves when it is ready. This is a recommended path made of existing pieces, not a single command.

## The data flows at a glance

The animations below each follow one piece of data from start to finish. Orange marks data that starts in Git, blue marks data that starts in Perforce, and purple marks kyln or a shared store. Some of these describe shipped behavior and some describe design work, and each caption says which.

![Animation: on git push, git-elfs writes large files to S3 under a sha256 key; a p4d archive trigger writes Perforce large files to the same bucket and keeps a pointer in the depot; both sides read the same object back with a hash check.](/assets/series/reconstitution-thesis/shared-bucket.gif)

Git and Perforce can share one S3 bucket, so one copy of each large file serves both. The Git side ships. The Perforce archive trigger exists as library code but is not yet packaged.

![Animation: piv clone projects a Perforce view into Git. A developer branches, piv shelve creates a shelved changelist for Swarm review, piv submit projects the branch into the depot, and piv pull brings the changelist back, linked to the developer's commits by provenance.](/assets/series/reconstitution-thesis/git-piv.gif)

`git piv` gives a Perforce view a Git workflow. Work happens on Git branches, `piv shelve` makes a shelved changelist for review, and `piv submit` projects the branch into the depot. Perforce stays the authority. This ships.

![Animation: fs-export reads a changelist, enforces export control, resolves LFS pointers and writes plain files to an NFS volume. A separate step snapshots and clones the volume for CI. An S3 upload lets fs-materialize rebuild the tree without Perforce.](/assets/series/reconstitution-thesis/fs-export.gif)

`fs-export` writes a changelist as plain files for builds that need no Perforce client. If any file in the changelist is denied, the whole changelist is rejected. This ships.

![Animation in four stages: P4 is the authority and kyln projects it into Git; Git users merge in Git and each merge is written through to P4; an epoch flip makes Git the authority while P4 users sync a read-only view; the P4 leg is retired when nothing reads it.](/assets/series/reconstitution-thesis/migration.gif)

The four epochs of a move without a big bang. One side is the authority at a time. Projecting merge requests to Perforce from CI is designed but not yet built.

![Animation: the server receives full blobs; an offload job copies large blobs to the store and writes a manifest before repacking them away as a promisor pack. A filtered clone fetches missing blobs from the store through git-remote-kyln.](/assets/series/reconstitution-thesis/promisor.gif)

Large-object promisors move big blobs to a store and fetch them on demand. This one is proposed, not shipped.

![Animation: Gerrit keeps every blob; clients take a filtered clone and lazy-fetch skipped blobs from Gerrit itself, the normal mode. With a store, an offload job copies large blobs out and repacks them away, and JGit's resolver reads a blob back on demand, installing it only if the SHA-1 matches; clients are unchanged.](/assets/series/reconstitution-thesis/gerrit-modes.gif)

Gerrit alone first, then Gerrit with a store behind it. The normal mode is stock Gerrit behavior. The store variant is under review.

![Animation: kyln projects Perforce changelists into Gerrit's repository and lists large files as promised. On a review, JGit asks an application-supplied resolver, which reads the blob from S3 or prints the depot revision. JGit installs the bytes only if the SHA-1 matches. Merges are projected back to Perforce.](/assets/series/reconstitution-thesis/gerrit-p4.gif)

Gerrit and Perforce through promised objects. This is a design sketch.

Every one of these flows crosses a boundary where two systems store different amounts of information. The next read is about what happens at that boundary, because the thesis lives or dies there.
