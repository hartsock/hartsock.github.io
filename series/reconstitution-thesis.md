---
layout: series
series: reconstitution-thesis
series_order: 4
permalink: /series/reconstitution-thesis/
title: "The Reconstitution Thesis"
tagline: "Nothing lost in translation: a lossy projection, a witness in the target, and a machine-checked way back."
blurb: >-
  How data can cross between two systems that store different amounts of
  information and lose nothing: write down what the target cannot carry, in
  the target, and let anyone recover the original from the copy alone.
editor_note: >-
  DRAFT. To publish, remove published: false here and from each part.
published: false
---
The source control system is not the point. It is an artifact: a record of
decisions people made, and the friction between one place that holds them and
the next. The history and the knowledge in it are the point. As the author of
this series, Shawn Hartsock, puts it: "The SCM system is an artifact. It is the
friction. It is NOT the point."

The author's diagram from January shows Git, Gerrit and Perforce as nodes, each pointing into a cloud: the real process, forced to conform to the surfaces of these tools.

![Shawn's January diagram: Git, Gerrit and Perforce as nodes, each pointing into a cloud labelled the real process, which is forced to conform to the surfaces of those tools.](/assets/series/reconstitution-thesis/the-cloud.png)

Six short reads on data preservation across a lossy boundary. A projection
between two source control systems has to lose bits, because one of them cannot
store everything the other can. This series is about how kyln records what was
lost, in the copy itself, so that the original is recoverable by anyone holding
the copy, with no central service and no access to the tool that made it.

You can reconstitute a Perforce depot from its Git copy alone, and kyln does it.
That is a bold claim, because the prior art says this information inevitably
gets lost when a depot moves to Git. The reconstitution run is the
counterexample. The end-to-end test seeds a depot with a text file, a binary
file and a keyword file, projects it to Git with witnesses written into the
target, obliterates the depot, rebuilds a fresh one from the Git repository
alone, and compares content and type. It runs as a gate in continuous
integration, and it passes. The project states it in one sentence: if P4D dies,
the git copy reconstitutes it as if nothing happened. The claim is a
consequence of the preservation, not its purpose. TLC checks the model and
Lean checks the algebra. Two obligations are still open, and part 6 lists them.

Each part stands on its own, and the animations in parts 2 to 5 show the proofs they
describe.
