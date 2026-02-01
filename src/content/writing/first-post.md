---
title: "Building with Intention: Lessons from the Kindle Oasis"
date: 2026-01-28
description: "Why the design philosophy of e-ink devices matters more than ever in an age of infinite distraction."
---

There's something deliberate about reading on an e-ink display. The page doesn't glow. It doesn't refresh at 120Hz. When you turn the page, the screen flashes—a momentary inversion of black and white that feels almost physical.

This is the antithesis of modern software design.

## The Attention Economy

We're surrounded by interfaces engineered to maximize engagement. Every notification, every pull-to-refresh, every infinite scroll is a carefully calibrated dopamine dispenser. The Kindle Oasis stands apart precisely because it *doesn't* do this. It has one job: display text for reading.

> "The best design is the least design."
> — Dieter Rams

## What We Can Learn

Building this blog, I wanted to capture that same sense of intentional restraint:

- **No animations** — Content appears instantly, without flourish
- **High contrast** — Text is meant to be read, not admired
- **Generous spacing** — Every element has room to breathe
- **Single purpose** — This is for reading, not engagement

## The Technical Choices

Astro was the natural choice here. It ships zero JavaScript by default, generating static HTML that loads instantly. The only interactivity is the theme toggle—and even that is instant, with no transitions.

The typography follows suit. Charter for body text, with its roots in Matthew Carter's work for Bitstream. Libre Baskerville for display, carrying the warmth of 19th-century type. No system fonts that change between platforms.

## Conclusion

In a world of increasingly complex web applications, there's value in simplicity. Not simplicity for its own sake, but simplicity in service of focus. This blog is an experiment in that philosophy—a space designed for reading, thinking, and writing without distraction.
