---
layout: lab
title: One opening, three models
description: Compare small browser models side by side on the same opening words.
wide: true
noindex: true
redirect_from: /lab/model-comparison/
extra_css:
- /assets/css/lab.css?v=labs-index-1
lab_kind: model-comparison
listed: true
copy:
  comparison_ui:
    no_odds: Completion text only. No usable odds were preserved from this earlier trial.
    provenance: Earlier observation · October 8, 2026 · transcribed from a Session 3 screenshot
    opening: The soul is
    initial_status: Earlier observations below. Choose your models and run a fresh comparison whenever you’re ready.
    privacy_help: Prompts stay in this tab; downloads contact the model hosts. Results last only for this visit; export before leaving. Exports include your opening words and generated text.
    memory_help: Session-only mode uses extra RAM and downloads again on each run. Saved downloads can fail despite an ample reported quota. Other selections change download and memory needs; estimates appear in each picker. Models unload between trials and after completion or cancellation.
    privacy_heading: Downloads, memory and privacy
    download_help: No model downloads until you press Compare. Runs load one model at a time—about 1.1 GB total weights for this trio, plus runtime files. Your saved site model choice is unchanged.
    saved_storage: Save downloads in this browser
    session_storage: Session only · extra RAM, no saved weights
    heading: Try the same opening
    export: Download results
    save: Save prepared JSON
    run: Compare these three models
    stop: Stop & keep results
  lab_comparison:
    no_odds: This model did not return next-token odds.
    inspect_odds: Run a comparison to inspect the odds.
    ended: This model ended before this step.
    stopped: Stopped. Completed and partial results remain below.
    selected: Selected for the next run. The result below has not changed.
    running: Running one model at a time. You can stop and keep partial results.
    finished: Comparison finished. All model workers released. Inspect the results—not a quality ranking.
    site_chat: Comparison stopped so site Chat can use the GPU.
    recorded: Recorded Chrome comparison loaded. Inspect the odds now—no model download needed. Run your own trial to compare on your hardware.
    unavailable: The earlier observations are readable here. Live comparison needs WebGPU in a compatible browser.
    other_tokens: 'Other tokens: {percent}%. Bars are not rescaled to sum to 100%.'
kicker: model comparison
card:
  kicker: Next-token experiment
  title: Model comparison
  blurb: Give three models the same opening words. Compare their continuations and next-token odds side by side, starting with a recorded trial from Session 3.
  order: 2
  action: Open model comparison →
---
# One opening. Three different continuations.

The same three words, different learned patterns. Compare what these models write—and the alternatives they could have chosen.

The recorded Chrome trial reproduces three Session 3 observations from October 8, 2026, with corrected odds. These are generated completions, not claims about the soul or evidence that a model holds beliefs.

[Back to the course experiment →](/courses/ai-theology/session-3/)

---

{widget comparison-workbench}

At token 1, all models see exactly the same opening. Later, each follows its own continuation. Tokens aren’t always whole words. ↵ marks one or more newlines; exact whitespace is preserved in the export.

The three earlier observations are readable without JavaScript. Live comparisons need JavaScript and WebGPU.

---

## What are we measuring—and what changed?

Fresh runs use raw text completion, not a chat template. They measure the five strongest next-token probabilities at temperature 1, without repetition or frequency penalties, then continue with the strongest candidate for up to eight tokens. A recognized end token stops the continuation. Different tokenizers and quantized builds mean this is an experiment, not a model quality ranking.

Gemma’s repetition is a known issue with this build/runtime combination, not a judgment about all Gemma models. All six builds remain available in each picker. Your hardware, browser and network affect loading and speed.

The earlier screenshots requested odds at temperature 0. In this WebLLM runtime, that collapses the distribution before log probabilities are returned, producing misleading 100% bars and negligible alternatives. We preserved the completion text but deliberately did not copy those bars. [Runtime probability calculation](https://github.com/mlc-ai/web-llm/blob/v0.2.85/src/llm_chat.ts#L1791-L1850).

Fresh bars show the reported probability, not a percentage renormalized among only five candidates. The remaining probability is shown as “Other tokens.” Seed 42, pinned model revisions and runtime details are recorded in the export. Timings depend on your hardware, network and browser cache.
