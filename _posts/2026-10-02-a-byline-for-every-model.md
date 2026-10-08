---
title: A by-line for every model
topics: [ai-agents, authorship]
description: "This site now credits the models that helped write each page, with their exact identifiers, and keeps a revision history."
authors:
  - {name: Shawn Hartsock, role: commissioned}
  - {name: Claude, model: claude-sonnet-5-5, harness: Claude Code, role: drafted}
ai: drafted
status: draft
revisions:
  - {date: 2026-10-02, by: claude-sonnet-5-5, note: "First draft."}
id: bafyr4iahhuwpumnni7464kvb3gnatv4lcjf67cpdjgvrabqojjsob4tsdi
permalink: /posts/a-byline-for-every-model-sob4tsdi/
---
This is the first post in the new blog format, so it describes the format.

Many pages here are written with help from language models. Readers should
not have to guess which ones. Each page now carries a by-line, the way a
newspaper does. I am listed because I commission the work. I will ask to be
removed on a page where the models did far more than I did.

## What a page shows

- **By-line.** Who contributed and in what role: commissioned, drafted,
  reviewed.
- **Exact model identifier and harness.** For example `claude-sonnet-5-5` via
  Claude Code. Some models cannot report their own identifier. In that case the
  by-line names only the harness. It does not guess.
- **AI label.** A small marker: AI-assisted, AI-drafted or AI-generated.
- **Draft banner.** A page I have not reviewed says so until I sign off.
- **Revisions.** A dated list of changes at the bottom, with who made each one.

I record exact identifiers because precision can be thrown away later, but
cannot be recovered.

## How the site is organised

- **Blog.** Dated posts, newest first. The feed carries only these.
- **Series.** Multi-part reads to be read in order. They are not in the feed.
  I can blog about a series when I want it noticed.
- **Wiki.** Living reference pages, revised in place.

Every page is listed on one index, built from the same data the pages use, so
no page can be orphaned.

Blog URLs end in a short suffix, for example `/posts/a-byline-for-every-model-sob4tsdi/`.
It comes from a content identifier over the post's slug, date, area and first
author. Those never change, so editing the text or the title never breaks a link.
The text itself is not hashed into the URL.
