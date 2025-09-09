#!/bin/bash

# Script to generate .cargo/config.toml with dynamic Xcode paths

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CARGO_CONFIG_DIR="$PROJECT_DIR/.cargo"
CARGO_CONFIG_FILE="$CARGO_CONFIG_DIR/config.toml"

# Detect Xcode installation
XCODE_PATH=$(xcode-select -p 2>/dev/null)
if [ -z "$XCODE_PATH" ]; then
    echo "Error: Xcode not found. Please install Xcode and run 'xcode-select --install'" >&2
    exit 1
fi

# Construct SDK paths
IOS_SDK_PATH="$XCODE_PATH/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk"
IOS_SIM_SDK_PATH="$XCODE_PATH/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator.sdk"

# Verify SDK paths exist
if [ ! -d "$IOS_SDK_PATH" ]; then
    echo "Error: iOS SDK not found at $IOS_SDK_PATH" >&2
    exit 1
fi

if [ ! -d "$IOS_SIM_SDK_PATH" ]; then
    echo "Error: iOS Simulator SDK not found at $IOS_SIM_SDK_PATH" >&2
    exit 1
fi

# Create .cargo directory if it doesn't exist
mkdir -p "$CARGO_CONFIG_DIR"

# Generate config.toml
cat > "$CARGO_CONFIG_FILE" << EOF
[target.aarch64-apple-ios]
linker = "$SCRIPT_DIR/ios-linker.sh"
rustflags = [
  "-C", "link-arg=-target",
  "-C", "link-arg=aarch64-apple-ios16.0",
  "-C", "link-arg=-isysroot",
  "-C", "link-arg=$IOS_SDK_PATH",
  "-C", "link-arg=-mios-version-min=16.0"
]

[target.x86_64-apple-ios]
linker = "$SCRIPT_DIR/ios-linker.sh"
rustflags = [
  "-C", "link-arg=-target",
  "-C", "link-arg=x86_64-apple-ios16.0-simulator",
  "-C", "link-arg=-isysroot",
  "-C", "link-arg=$IOS_SIM_SDK_PATH",
  "-C", "link-arg=-mios-simulator-version-min=16.0"
]

[target.aarch64-apple-ios-sim]
linker = "clang"
rustflags = [
  "-C", "link-arg=-target",
  "-C", "link-arg=aarch64-apple-ios16.0-simulator",
  "-C", "link-arg=-isysroot",
  "-C", "link-arg=$IOS_SIM_SDK_PATH",
  "-C", "link-arg=-mios-simulator-version-min=16.0"
]

[env]
IPHONEOS_DEPLOYMENT_TARGET = "16.0"
OPENSSL_VENDORED = "1"
OPENSSL_STATIC = "1"
EOF

echo "Generated .cargo/config.toml with dynamic Xcode paths:"
echo "  iOS SDK: $IOS_SDK_PATH"
echo "  iOS Simulator SDK: $IOS_SIM_SDK_PATH"
echo "  iOS Linker: $SCRIPT_DIR/ios-linker.sh"
