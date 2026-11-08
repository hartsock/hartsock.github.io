---
title: Where two enforcers disagree
topics: [capability-security, ai-agents, testing]
description: "A rotatable picture of an eight-dimensional authorization space, showing where two enforcement programs drift from the rule they enforce."
authors:
  - {name: Shawn Hartsock, role: commissioned}
  - {name: Claude, model: claude-opus-5-5, harness: Claude Code, role: drafted}
ai: drafted
status: draft
published: false
wide: true
extra_css:
  - /assets/css/explorer.css?v=explorer-1
revisions:
  - {date: 2026-11-08, by: claude-opus-5-5, note: "First draft, with the Geometric Semantics Explorer."}
copy:
  explorer:
    badge: "Synthetic demonstration"
    caption: "An 8-dimensional authorization state space, projected into 3D."
    hint: "Drag to rotate. Pinch, or use the zoom buttons, to zoom. Tap a state to inspect it."
    label_projection: "Projection"
    label_colour: "Vertex colour"
    label_show: "Show"
    label_dims: "Dimensions and slices"
    dims_note: "Edge colour names the dimension an edge flips. Fix a coordinate to 0 or 1 to slice the cube."
    label_legend: "Legend"
    label_selected: "Selected state"
    label_integrity: "Projection integrity"
    integrity_note: "3D distance is not semantic distance. Edges always join states that differ in exactly one real coordinate."
    label_views: "Local views"
    empty_selection: "Tap a state. Red diamonds mark where enforcer 2 allows a request the policy denies."
    neighbours: "Neighbours, one coordinate flipped"
    load_error: "The explorer data did not load. Reload the page to try again."
    proj_star: "Each of the 8 dimensions gets its own direction in 3D. A state sits at the sum of its coordinates along those directions. No two directions coincide, but many states still land close together."
    proj_axes: "Three chosen dimensions become X, Y and Z. The other five are squeezed into a small offset, so each corner holds a cluster of 32 states."
    proj_force: "Edges act as springs and states push each other apart. This layout follows adjacency alone and ignores what the coordinates mean."
    class_unsafe: "Unsafe. An enforcer allows what the policy denies."
    class_shared: "Shared defect. Both enforcers allow what the policy denies."
    class_restrict: "Restrictive. An enforcer denies what the policy allows."
    class_allow: "The policy and both enforcers allow it."
    class_deny: "The policy and both enforcers deny it."
    class_unobs: "Reachable, but not observed in this dataset."
    class_ghost: "Unreachable. No real request has these properties."
    legend_allow: "ALLOW"
    legend_deny: "DENY"
    legend_weight: "Hue counts how many coordinates are set to 1."
    legend_component: "Each connected disagreement region gets its own hue."
    legend_outcome: "Colour shows what the request returned under enforcer 2."
    legend_broken: "An edge where the enforcer changes its answer differently from the policy."
    legend_boundary: "An edge where the policy decision flips."
    views_note: "Teal rings mark the states operator A can see. Pink rings mark what operator B can see. These views are subsets, so if the two operators agreed on their whole overlap, their answers would join into exactly one global answer. That still would not show the answer matches the policy."
id: bafyr4id3y33zdmqn53ntsdwrquc6yeoosyipynd2hwdep47jdljuhcicua
permalink: /posts/geometric-semantics-explorer-juhcicua/
---
This is a picture of a question I keep coming back to. Two programs claim to
enforce the same authorization rule. Where do they actually disagree with it,
and can you see the disagreement before it bites?

The picture below is a rotating cube with eight dimensions. Every point is one
request a process might make. Every colour tells you whether the rule and the
two programs agree about that request.

## What a point means

A point is one concrete request, described by eight yes-or-no properties:

- **Operation.** Read or write.
- **Location.** Inside the authorized root, or outside it.
- **Target.** A regular file, or a symbolic link.
- **Identity.** An authorized identity, or not.
- **Traversal.** Whether the path climbs out with a dot-dot component.
- **Existence.** Whether the file exists.
- **Environment.** A trusted environment, or an untrusted one.
- **Route.** A direct request, or one delegated through another program.

Eight yes-or-no properties give 256 combinations. Changing one property moves
you along one edge of the cube. The edge colour names that property, so the
rainbow you see is the eight dimensions.

## The rule and the two enforcers

The rule is deliberately simple. A process may read a regular file inside the
authorized root, as an authorized identity, with no traversal, in a trusted
environment. Everything else is denied.

Two enforcement programs are supposed to implement that rule:

- **Enforcer 1** forgets to check the environment, and it refuses every
  delegated request. That second habit is safe but too strict.
- **Enforcer 2** also forgets the environment. It also follows symbolic links
  without checking where they lead. That is the planted bug.

Some combinations cannot happen in practice. An unauthorized identity in an
untrusted environment would need a second user account on the machine, so
those 64 points are drawn as faint rings and marked unreachable.

{widget semantics-explorer}

## Things to try

- **Find the bug.** The red diamonds pulse. Tap one. The inspector lists its
  eight neighbours and flags each edge where enforcer 2 changes its answer
  differently from the rule.
- **Slice down to the bug.** Fix the target to 1 for symbolic link, the
  operation to 0 for read, the identity to 1 and the traversal to 0. Sixteen
  states remain, and almost all of them are red. The planted bug is a
  four-dimensional face of the cube. It is one connected region.
- **Change the projection.** Eight dimensions do not fit in three. Switch
  between the projections and watch the same points move. The integrity panel
  reports how many points overlap and how well drawn distance tracks the real
  number of differing properties.
- **Look for the purple squares.** In those states both enforcers agree with
  each other, and both are wrong. Neither one checks the environment.

## Agreement is not correctness

The purple squares are the part I care about most. If you only compare two
implementations against each other, you will never see them. They agree.

Turn on the local views for a second version of the same problem. Operator A
sees direct requests through enforcer 1. Operator B sees trusted environments
through enforcer 2. Where their views overlap, they agree on 58 of the 62
observed states, and the four they disagree on are the symlink bug. The purple
squares sit entirely outside operator B's view, so comparing the two views can
never surface them. Agreement between views tells you about the views. It
does not tell you about the rule.

## What this is not

Everything here is synthetic. A small script generates the dataset from the
rule and the two buggy enforcers, and the page only draws what that file says.
Nothing was observed by running real commands yet.

It is also not evidence that geometry finds bugs faster than ordinary testing.
That is an open research question. A planted bug like this one is caught by a
well-chosen set of a few dozen test combinations, without any geometry. The
experiment I want to run compares geometric sampling against that kind of
baseline, on real file operations, with bugs that nobody chose for their
shape. If geometry loses, that is a result worth writing up too.

The research steer started in a conversation with ChatGPT. Claude built this
explorer from it. The broader question behind it, whether the code that
enforces a rule really preserves its meaning across updates, is tracked in
[newt-agent issue 3059](https://github.com/Gilamonster-Foundation/newt-agent/issues/3059).
