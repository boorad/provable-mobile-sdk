fn main() {
    println!("cargo:rerun-if-changed=src/rust/lib.rs");

    let target = std::env::var("TARGET").unwrap();
    let is_android = target.contains("android");
    
    let mut build = cxx_build::bridge("src/rust/lib.rs");
    
    // Add the C++ files that need to be compiled
    build.file("src/cpp/HybridAccount.cpp");
    build.file("nitrogen/generated/shared/c++/HybridAccountSpec.cpp");
    
    if is_android {
        build.file("android/src/main/cpp/cpp-adapter.cpp");
    }
    
    // Include necessary directories
    build
        .include("src/cpp")
        .include("build/includes")
        .include("build/includes/rust")
        .include("nitrogen/generated/shared/c++");
    
    // Use C++20 for both platforms
    build.std("c++20");
    
    build.flag_if_supported("-fPIC");
    
    // Add platform-specific includes for React Native JSI
    if is_android {
        // Android-specific JSI headers path
        if std::path::Path::new("../../node_modules/react-native/ReactAndroid/src/main/jni/react/jsi").exists() {
            build.include("../../node_modules/react-native/ReactAndroid/src/main/jni/react/jsi");
        } else {
            build.include("../../node_modules/react-native/ReactCommon/jsi");
        }
    } else {
        // iOS JSI headers path
        build.include("../../node_modules/react-native/ReactCommon/jsi");
    }
    
    build.compile("provable_mobile_sdk");
}
