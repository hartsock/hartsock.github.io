---
layout: lab
title: Browser chat lab
description: Try six small language models on your own hardware, with a public page as context.
wide: true
noindex: true
redirect_from: /lab/
extra_css:
- /assets/css/lab.css?v=labs-index-1
lab_kind: browser-chat
listed: true
copy:
  chat_ui:
    sample: 'Sample: {link.sample}. Changing context starts a new conversation. Prompts stay in this tab; downloads contact the model hosts. Nothing is sent to an inference service by this Lab.'
    context_toggle: Include the public article and its metadata
    smoke: Run smoke test · selected model
    placeholder: Who commissioned this page? What is its status?
    no_tests: No tests run this visit.
    conversation: Try a conversation
    session_storage: Session only · experimental · extra RAM, no saved weights
    saved_storage: Save downloads in this browser
    send_help: Type a message and press Send. If needed, the model downloads first and your message sends automatically when it is ready. You can also preload with Load model or run the smoke test. Session-only mode uses extra RAM and downloads again after unloading; saved downloads may hit browser storage limits even when the displayed quota looks ample.
    preparing: Preparing the lab…
    context_summary: Inspect exactly what the model receives
    export_help: Conversations and results are held only for this visit, not saved automatically. Leaving the Lab unloads its model and clears them; export first if you want to keep them. Exports contain your prompts and generated replies. Never treat a model reply as verified source material.
    review_summary: Smoke-test replies and review guide
    loading_title: Loading your model
    loading_help: Your message is waiting. It will send automatically when the model is ready. The first download may take a little while.
    loading_preparing: Preparing the model…
    clear: New conversation
    export: Download this visit’s results
    save: Save prepared JSON
    stop: Stop & unload
  links:
    sample: A by-line for every model
  lab_chat:
    send: Send
    stopped: Stopped. Model worker released; results retained until you leave.
    quota: Browser storage refused the model download. Try session-only mode or a smaller model. The displayed quota is not a guarantee.
    no_webgpu: WebGPU is unavailable. Try desktop Chrome or Edge, or choose another source in Model settings.
    review_label: Review guide · not an automatic score
    weight_label: Weight download / estimated GPU memory
    timing_label: Median first token / complete reply
    invalid_speed: Invalid output; no useful speed score
    site_chat: Site chat selected. Lab model released; results retained until you leave.
    cancelled: Loading cancelled. Your message has not been sent; it is still in the message box.
    selection_changed: Selection changed. Type a message and press Send.
    bounded: Start a new conversation to keep this small model’s context bounded.
    missing_context: The sample article has not loaded.
    complete: Reply complete. Compare factual claims with the source; use New conversation if context fills up.
    smoke_complete: Six replies recorded. Read the answers against the review guide—completion is not a passing score.
    exported: JSON export prepared. If the download did not start, choose Save prepared JSON. It includes your prompts and replies.
    settings: Lab stopped. Use Model settings to choose another source for the site.
    missing_article: Article context is missing.
    ready: Ready. Type a message and press Send; the model will load if needed.
    unavailable: WebGPU is unavailable. Try desktop Chrome or Edge, or another source.
    loading_memory: '{note}. Session only: downloaded weights are held in RAM, not saved.'
    loading_cache: '{note}. Downloads will be saved when your browser allows it.'
    loaded: '{label} ready in {seconds}. Answers are experimental; check them against the page.'
    selected: Selected {label}. Type a message and press Send.
    not_sent: '{error} Your message has not been sent. It is still in the message box; retry when ready.'
  lab_prompt:
    ungrounded: You are a helpful concise assistant.
  reviews:
    smollm_small: Says hello, but failed name recall. Page answers repeated themselves, gave incorrect URL inputs and contradicted the feed rules.
    qwen_small: Improved page answers, but omitted the requested exact model identifier. Conversation follow-up repeated its greeting instead of answering.
    qwen_default: Most consistent page facts in the manual follow-ups and correctly declined to invent a version. Failed to remember the visitor’s name. Not yet a reliable general chat assistant.
    gemma: Loaded after a window-size adjustment and handled a short greeting. With page context, this build/runtime combination produced empty answers or repeated code fences. Kept for investigation, not recommended.
    smollm_large: Contradictory name recall and unsupported page claims. Invented “Claude Code” as the WebLLM version. No demonstrated advantage over the smaller Qwen options.
    qwen_large: Remembered the visitor’s name. Scripted page answers improved, but manual follow-ups named the wrong first author and confused a drafting-model ID with the WebLLM version.
kicker: browser chat
card:
  kicker: Conversation & page Q&A
  title: Browser chat
  blurb: 'The original chat lab: six model cards, a conversation pane and smoke tests. Say hello, add a public article as context, and see what a small model can answer on your hardware.'
  order: 1
  action: Open browser chat →
---
# Small models. Real questions.

Say hello, then ask a model to read a page with you. Six experimental builds, one shared test. Your hardware is part of the experiment.

Qwen3.5 0.8B is our starting choice for page Q&A—not a guarantee of accuracy. Models are listed smallest-to-largest by weight download; estimated GPU memory is shown separately. RAM, GPU, browser settings and context length affect whether a model loads and how it performs.

[Open the chat pane ↓](#lab-workbench)

[One opening, three models: compare continuations side by side →](/labs/model-comparison/)

---

## Meet the models

Observed on 2026-10-08: Chrome 155, Apple / Metal 3, 16 GiB memory. Session-only loading, WebLLM 0.2.85, temperature 0, seed 42, Qwen thinking off. Reply timings are medians across four questions about one article. They include incorrect answers: speed is not an accuracy score.

{widget browser-models}

JavaScript and WebGPU are required for this experiment. Ordinary site navigation and reading still work without them.

---

## How to interpret these numbers

This was a smoke test, not a benchmark. We checked a greeting, name recall, three page questions and one question with no answer in the page. We then challenged the two Qwen finalists with matched follow-ups. Neither was consistently reliable. No overall score is claimed: simple keyword checks incorrectly counted some wrong answers as correct.

Download sizes count quantized weights, excluding runtime and tokenizer. GPU memory estimates come from the WebLLM catalog at a 4,096-token context, not measured total RAM. The browser, temporary buffers and session-only weight storage need additional memory. Gemma’s estimate also predates our window override. Leave headroom; a listed size is not a promise that it will fit.

Load times are observed download/reload times, not controlled cold-start benchmarks. Use this pane to measure your own machine and inspect the actual answers before trusting a result.

---

{widget browser-workbench}

---

## Doesn’t fit your machine?

Try a smaller model, or use the site’s [Model settings](#model-settings) to choose another source. Switching to another source ends this Lab session; the Lab itself tests only browser models.

**OpenRouter:** choose a model that actually has a `:free` entry and verify its pricing. Not every model is free, and adding `:free` to an arbitrary name does not make it free. Free availability and rate limits vary; paid choices can incur charges. Your prompts go to OpenRouter and its model provider. [Free-model guidance](https://openrouter.ai/docs/guides/routing/model-variants/free).

**Your own inference:** connect an OpenAI-compatible endpoint, such as Ollama or LM Studio with cross-origin access configured. Cost, privacy and capacity then depend on the service you choose.
