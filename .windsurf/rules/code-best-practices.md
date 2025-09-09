---
trigger: glob
globs: *.hpp,*.cpp
---

# Best Practices - Code

## General
- Do not add comments unless explicitly told to do so, or the code is complex enough to warrant an explanation

## C++
- Pay special attention to Nitro Modules and its concept of ownership for Array Buffers.
  - created on the native side = "owning"  You can safely access data so long as the reference is alive, and accessed from different threads
  - created on JS side and received as a parameter = "non-owning"  You can only safely access it before the synchronous function returned.  If you need a non-owning buffer's data for longer or in different threads, copy it first.
- Nitro array buffers and threading: An ArrayBuffer can be accessed from both JS and native, and even from multiple Threads at once, but they are not thread-safe. To prevent race conditions or garbage-data from being read, make sure to not read from- and write to- the ArrayBuffer at the same time.
- Do not use full paths for includes.  The setup-clang-env.sh script should set them up for IDE environment (VSCode), and the build systems of ios and android should set them for builds.
- Use smart pointers in C++
- Use modern C++ features
- Attempt to reduce the amount of code rather than add more
- Prefer iteration and modularization over code duplication

## TypeScript

- Use TypeScript for all code
- Prefer interfaces over types.
- Use lowercase with dashes for directories (e.g., `components/auth-wizard`).
- Favor named exports for components.
- Avoid `any` and enums; use explicit types and maps instead.
- Avoid conversion to `unknown` and then a type.
- Use functional components with TypeScript interfaces.
- Enable strict mode in TypeScript for better type safety.
- Suggest the optimal implementation considering:
  - Performance impact
  - Maintenance overhead
  - Testing strategy
- Code examples should follow TypeScript best practices.
