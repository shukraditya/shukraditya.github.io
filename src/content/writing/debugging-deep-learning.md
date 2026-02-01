---
title: "Debugging Deep Learning Models: A Practical Guide"
date: 2026-01-15
description: "Systematic approaches to finding and fixing issues in neural network training—from silent shape mismatches to vanishing gradients."
---

Training a deep learning model is debugging in slow motion. Each epoch takes minutes or hours, and when something goes wrong, you're often left staring at loss curves, wondering what went wrong.

After months of training various architectures, I've developed a systematic approach to debugging neural networks.

## The Sanity Check

Before diving into gradient flow analysis, start simple:

```python
# 1. Overfit a single batch
model.train()
for epoch in range(100):
    loss = model(batch).loss
    loss.backward()
    optimizer.step()
    # Loss should go to ~0

# 2. Check shapes at every layer
for name, param in model.named_parameters():
    print(f"{name}: {param.shape}, grad: {param.grad is not None}")
```

If you can't overfit a single batch, your model has a fundamental issue—architecture bug, incorrect loss function, or gradient flow problem.

## Common Culprits

### The Learning Rate Trap

Too high: loss explodes. Too low: no learning. But there's a subtler failure mode: the loss decreases, but the model isn't actually learning meaningful features.

**Check:** Visualize first-layer weights. Do they look like Gabor filters (for images) or random noise?

### Silent Shape Mismatches

PyTorch's broadcasting can hide bugs:

```python
# Silent bug: (batch, 10) + (10,) works but may not be what you want
logits = model(x)  # (32, 10)
loss = criterion(logits, labels)  # labels is (32, 1) — broadcasting applies
```

Always assert shapes explicitly:

```python
assert logits.shape == (batch_size, num_classes)
assert labels.shape == (batch_size,)
```

### The Data Leak

This one hurts. You preprocess your data, accidentally include test statistics in normalization, and suddenly your "95% accuracy" model fails in production.

**Rule:** Any transformation that uses data statistics must fit on train only.

## Tools That Help

- **Weights & Biases**: Track metrics, visualize gradients, compare runs
- **PyTorch Profiler**: Find bottlenecks in data loading vs. computation
- **Grad-CAM**: Visualize what your CNN is actually looking at

## When All Else Fails

1. Write a test for every component
2. Train on synthetic data with known outputs
3. Compare against a reference implementation
4. Ask someone else to review—fresh eyes catch obvious bugs

The best debugging tool is still a systematic mind and a willingness to question assumptions.
