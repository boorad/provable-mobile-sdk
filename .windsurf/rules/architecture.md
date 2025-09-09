---
trigger: always_on
---

# Provable Mobile SDK - Library Architecture

- This is a library to allow React Native mobile applications to use the Provable SDK, written in Rust
- It uses Nitro Modules (https://nitro.margelo.com/llms-full.txt) to bridge between JS/TS of React Native, using C++ generated code to talk to Rust FFI code that accesses the Provable Rust SDK.
- Coverage should be very similar to the web-based JS/TS Provable SDK (https://github.com/ProvableHQ/sdk/tree/mainnet/wasm)
