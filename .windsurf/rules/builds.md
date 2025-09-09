---
trigger: always_on
---

# Build Systems

## Javascript & Typescript
- use `bun`
- to generate Nitro specs, run `bun specs`

## Rust
- use `cargo`

## C++
- use `clang` (MacOS during initial development)

# Troubleshooting

## Nitro Modules

### nitro-codegen hanging or memory issues
If `nitro-codegen` hangs on "Loading nitro.json config..." or crashes with memory errors:

1. **Add more paths to ignorePaths in nitro.json**:
   ```json
   "ignorePaths": ["node_modules", "lib", "nitrogen/generated", "target", "build", ".cache", "dist"]
