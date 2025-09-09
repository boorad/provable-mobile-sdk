#!/bin/bash

# Custom iOS linker wrapper to avoid macOS runtime library linking
# This script filters out problematic macOS libraries and uses iOS-specific ones

# Detect Xcode installation dynamically
XCODE_PATH=$(xcode-select -p 2>/dev/null)
if [ -z "$XCODE_PATH" ]; then
    echo "Error: Xcode not found. Please install Xcode and run 'xcode-select --install'" >&2
    exit 1
fi

# Get clang version dynamically
CLANG_VERSION=$(clang --version | head -n1 | sed -n 's/.*clang version \([0-9]*\).*/\1/p')
if [ -z "$CLANG_VERSION" ]; then
    CLANG_VERSION="17"  # fallback to version 17
fi

# Construct runtime library paths
CLANG_LIB_DIR="$XCODE_PATH/Toolchains/XcodeDefault.xctoolchain/usr/lib/clang/$CLANG_VERSION/lib/darwin"
IOS_RUNTIME_LIB="$CLANG_LIB_DIR/libclang_rt.ios.a"

# Verify the iOS runtime library exists
if [ ! -f "$IOS_RUNTIME_LIB" ]; then
    echo "Warning: iOS runtime library not found at $IOS_RUNTIME_LIB" >&2
    echo "Proceeding without explicit iOS runtime library..." >&2
    IOS_RUNTIME_LIB=""
fi

# Filter out macOS runtime library arguments
filtered_args=()
skip_next=false

for arg in "$@"; do
    if [ "$skip_next" = true ]; then
        skip_next=false
        continue
    fi
    
    case "$arg" in
        *libclang_rt.osx*)
            # Skip macOS runtime library
            continue
            ;;
        -lclang_rt.osx)
            # Skip macOS runtime library flag
            continue
            ;;
        *)
            filtered_args+=("$arg")
            ;;
    esac
done

# Add iOS-specific runtime library if it exists
if [ -n "$IOS_RUNTIME_LIB" ] && [ -f "$IOS_RUNTIME_LIB" ]; then
    filtered_args+=("-L$CLANG_LIB_DIR")
    filtered_args+=("$IOS_RUNTIME_LIB")
fi

# Execute clang with filtered arguments
exec clang "${filtered_args[@]}"
