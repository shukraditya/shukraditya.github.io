---
title: "Understanding Transformers: The Math Behind Attention"
date: 2026-01-30
description: "A gentle introduction to the mathematical foundations of transformer architectures and self-attention mechanisms."
author: "Shukraditya"
---

The transformer architecture has revolutionized natural language processing since its introduction in "Attention Is All You Need." At its core lies a deceptively simple idea: let every token attend to every other token directly.

## The Attention Mechanism

Given query, key, and value matrices $Q$, $K$, and $V$, the scaled dot-product attention is defined as:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

The scaling factor $\frac{1}{\sqrt{d_k}}$ prevents the dot products from growing too large in magnitude, which would push the softmax into regions with extremely small gradients.

## Multi-Head Attention

Rather than performing a single attention function, the transformer uses multiple "heads" in parallel:

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, ..., \text{head}_h)W^O$$

Where each head is computed as:

$$\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

## Positional Encoding

Since transformers have no inherent notion of sequence order, we inject positional information:

$$PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

$$PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

These sinusoidal encodings allow the model to attend to relative positions, as $PE_{pos+k}$ can be represented as a linear function of $PE_{pos}$.

## Why It Works

The brilliance of self-attention lies in its $O(n^2)$ complexity with respect to sequence length. While expensive for very long sequences, it enables:

- **Parallelization**: All positions are processed simultaneously
- **Long-range dependencies**: Direct connection between any two positions
- **Interpretability**: Attention weights reveal what the model "looks at"

The transformer represents a fundamental shift from recurrent architectures, trading sequential computation for global attention.