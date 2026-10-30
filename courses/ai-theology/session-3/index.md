---
layout: lesson
title: Making Minds? — Session 3
description: 'What an engine can represent: next-word odds and a map of meaning.'
wide: true
noindex: true
extra_css:
- /courses/app/app.css?v=primary-buttons-1
course: ai-theology
session_order: 3
view: session3
card:
  title: 'Session 3: What an engine can represent'
  description: Lovelace’s claim about origination, next-word odds, and a map of meaning.
draft_record:
  revision: r1
  date: '2026-10-05'
  status: draft
  authored:
  - who: Shawn Hartsock
    what: the course, its guiding question, and the request for these visualizations
  - who: Claude (Anthropic), working in Claude Code
    what: the page, its captions and discussion questions, and the scripts that captured the data
  - who: ornith-1.5-35b (open-weight language model)
    what: the captured next-word odds, including the completion of Lovelace’s sentence
  - who: all-MiniLM-L6-v2 (embedding model)
    what: the word similarities behind the meaning map
  reviewed: []
  not_yet: No person has reviewed this page’s text, captions or questions. The course syllabus itself is provisional
    and under historical and theological audit.
values:
  dimensions: '384'
  nextModel: ornith-1.5-35b
  topCandidates: '10'
  steps: '8'
  nextCaptured: '2026-10-04T23:32:23+00:00'
  nextId: bafyr4ibnayxvtyafn7sngvmagy2wklyrkmpv7tbucs3tjerxrshoavrcca
  mapModel: sentence-transformers/all-MiniLM-L6-v2
  mapLayout: classical MDS on cosine distance, random_state=7
  mapCaptured: '2026-10-04T23:33:24+00:00'
  mapId: bafyr4iawzkbrmxl62gawyqlgpxnbic2xcbvgpafzgfcgn7pn2hfcr37pby
  map3dLayout: classical MDS on cosine distance, 3 components, random_state=7
  map3dCaptured: '2026-10-30T22:00:00+00:00'
  map3dId: bafyr4ia62w5kvfzoth4v7ixn6iy3shpjpqczw2kbjvk6tlunc4w4znztsm
  lovelaceOdds: '99'
copy:
  lesson_ui:
    live_model_help: Browser models are listed by download size; GPU memory needs vary. This changes the site-wide
      choice. Selecting here unloads the previous browser model; downloading waits until you press Ask the model.
      Previous results keep their original model label.
    ask_box: Could a machine ever originate an idea, or only recombine what it was given?
    compare_help: Try the same opening with different models. Keep the opening words and temperature fixed, change
      the model, then ask again. Compare the favourite next word and the alternatives—not just the finished sentence.
    compare_link: Compare three models side by side in Labs →
    neighbours: Closest in all 384 numbers
    map3d_hint: Drag to rotate, scroll to zoom
    map3d_note: Same words, same 384 numbers as the map above, now fit to a third axis instead of flattened onto a
      page. Rotating still cannot avoid some distortion; a fourth number would be needed to match the groups exactly
      as they cluster.
    conscience: Look at “conscience.” Its nearest neighbour is “consciousness.” The model places them together because
      the words look and are used alike, not because it holds a view on how conscience and awareness relate.
    answer_empty: The answer will appear here.
    captured: Captured examples
    try_words: Try your own words
    previous: ← Previous word
    next: Next word →
    roll: Roll the dice
    odds_label: Candidate next words and their odds
    opening: The soul is
    table: Show the map as a table
    quote_prefix: The Analytical Engine has no pretensions whatever to
  lesson_state:
    starting: Starting the model. The first time, this includes a one-time download.
    no_webgpu: This browser cannot run a model locally. Use the model button at the top to choose another source.
    rolled: Rolled a different word. The odds after it were never computed, so this path stops here.
    opening: Type an opening and ask the connected model.
    no_odds: This model does not share its odds. Try the in-browser model.
    done: Done. Step through the words below, then try another model with the same opening.
    no_webgpu_live: This browser cannot run a model locally. Use the model selector to connect another source.
    no_webgpu_ask: This browser cannot run a model locally. Use the model button at the top to connect another source.
    progress: Starting the model… {percent}%
    load_failed: 'Could not start the model: {error}'
    selected: Selected {source}. Press Ask the model to compare the same opening.
    temperature_normal: '{source}. Temperature 1.0: relative odds among the displayed candidates.'
    temperature_zero: '{source}. Temperature 0: the strongest word always wins.'
    temperature_low: '{source}. Below 1, the strongest word pulls ahead.'
    temperature_high: '{source}. Above 1, weaker words get a bigger share.'
  lesson_prompt:
    assistant: You are a careful assistant in a seminar where pastors and Christian educators are learning how AI
      systems work. Answer briefly and plainly. Say when you are unsure. Do not claim feelings, beliefs or religious
      authority. Do not tell people what to believe; describe positions fairly.
evidence:
  lovelace: originate anything.
---
*Ada Lovelace, Note G, 1843 · completed by a 2026 language model*

{widget lovelace-quote}

The black words are Lovelace’s. The blue words were written by a language model given only the black ones. It chose “originate” over every other word in its vocabulary with odds of **{lovelaceOdds}%**.

### What this shows

The model has absorbed this famous sentence from text it was trained on, and reproduces it with near certainty.

### What this does not show

It does not show that the model agrees with Lovelace, understands her, or refutes her. Reciting a claim about originality is not evidence for or against it.

---

*Plate 1 · Next-word odds*

## Writing is choosing, one word at a time

At each step a model scores every word it knows and one is picked. The bars show its strongest candidates.

{widget next-word}

### What this shows

Familiar texts produce one overwhelming candidate. Open questions spread the odds across many plausible words. “Temperature” is a dial a person sets: low makes the strongest word win, high gives weaker words a real chance.

### What this does not show

Odds are not intentions, beliefs, or understanding. Only the strongest candidates are drawn, rescaled to add up to 100%. Different models give different odds for the same words.

---

*Plate 2 · A meaning map*

## To a model, a word is a place

An embedding model turns each word into {dimensions} numbers. Words used in similar ways in its training text end up with similar numbers. Here those numbers are flattened onto a page. Pick a word to see its three closest neighbours.

{widget meaning-map}

### What this shows

Usage in text has a shape. Grace sits near mercy and salvation; machine sits near computer and engine. Some neighbours are surprising, and the surprises are good discussion material.

### What this does not show

Nearness means “used alike in text,” not “the same meaning” or “theologically related.” Flattening {dimensions} numbers onto a page distorts distances, so trust the neighbour list over the picture.

---

*Plate 2b · The same map, one more axis*

## A third number helps, but does not finish the job

The same {dimensions}-number vectors, fit to three dimensions instead of two. Drag to turn it; the clusters by colour pull apart more than they did flat.

{widget meaning-map-3d}

### What this shows

A third axis recovers some of what the flat map hid. Clusters that overlapped on the page separate out in space, and a few neighbour pairs that looked close only because of the flattening now sit apart when you turn the view.

### What this does not show

Three numbers out of {dimensions} is still a drastic cut. A cluster that looks tight from one angle can be spread out from another; keep turning before judging a pair close or far. The neighbour list, computed from all {dimensions} numbers, is still the only exact answer.

---

*Plate 3 · Question the model*

## Ask, then examine the answer

{widget question-model}

### What this shows

How one model, with these instructions, answers your question today. Ask the same thing twice, or switch models, and compare.

### What this does not show

An answer is generated text, not a source. It can be confident and wrong, and it carries no authority. Check anything that matters against the readings.

---

*For discussion*

## Rules, representation, origination

1. When the model finishes Lovelace’s sentence with {lovelaceOdds}% odds, is it following rules, representing her idea, or neither? What would change your answer?

1. Turn the temperature up on “The most important thing a pastor does is.” If a surprising word appears, who originated it: the model, the person who set the dial, or the thousands of writers in its training text?

1. The map puts “conscience” next to “consciousness.” What does a pastor mean by conscience that this geometry cannot hold?

---

*Where the captured figures come from*

Plate 1 (captured): `{nextModel}`, an open-weight model on local hardware. Temperature 0, top {topCandidates} candidates, {steps} words per opening. Captured {nextCaptured}. Capture id `{nextId}`.

Plate 2: `{mapModel}`, {dimensions} numbers per word. Layout: {mapLayout}. Captured {mapCaptured}. Capture id `{mapId}`.

Plate 2b: same model and words as Plate 2. Layout: {map3dLayout}. Captured {map3dCaptured}. Capture id `{map3dId}`.

A capture id is a content address: change any number in the capture and the id changes.
