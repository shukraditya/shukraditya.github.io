## Installing
```
uv pip install jax numpy
uv pip install 'jax[cuda12]'
```

## basics
> [!note] Note
> Acceleration comes from JIT compilation via XLA compiler
> - Optimises the computation graph
> - sequence of ops fused into single efficient computation
> - eliminate redundant computations

Possible ways to run the code:
1. pure numpy
2. jax on cpu
3. jax jit compiled code on cpu
4. jax on gpu
5. jax jit compiled on gpu

>[!note] Auto vectorization
> converts single element fn to batch processing fn

follows the functional programming paradigm. not really OOPS oriented like PyTorch.
no hidden states, everything visible. [Side effects](https://ericnormand.me/podcast/what-are-side-effects) dont work with JIT.


## jargon
XLA: Xcelerated Linear Algebra
Autograd: compute derivatives of NumPy code. predecessor to jax
JAX = XLA+Autograd

## composable transformations
python+numpy code can be transformed.
4 main transformations:
1. autodiff
2. jit compilation: jit uses XLA to compile and produce GPU/TPU-efficient code.
3. auto-vectorization: `vmap()` single item -> batch aka auto-batching. 
4. parallelizing code: to run code on multiple accelerators via `pmap()` -> SPMD (single-program multiple-data). `pmap()` compiles using XLA, replicates and executes on it's XLA device in parallel



tag-along notebook: [jax-learning-1](https://github.com/shukraditya/jax-learning/blob/master/jax-1.ipynb)