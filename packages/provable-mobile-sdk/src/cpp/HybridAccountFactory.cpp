#include "HybridAccountFactory.hpp"
#include "HybridAddress.hpp"
#include "HybridPrivateKey.hpp"
#include "HybridViewKey.hpp"

// Forward declarations for Rust FFI functions
extern "C" {
void* private_key_new();
void* private_key_from_string(const char* private_key_str);
void* address_from_string(const char* address_str);
void* view_key_from_string(const char* view_key_str);
}

namespace margelo::nitro::provable {

std::shared_ptr<HybridPrivateKeySpec> HybridAccountFactory::createPrivateKey() {
  void* rust_handle = private_key_new();
  if (rust_handle == nullptr) {
    throw std::runtime_error("Failed to create private key");
  }

  auto privateKey = std::make_shared<HybridPrivateKey>();
  privateKey->_setRustHandle(rust_handle);
  return privateKey;
}

std::shared_ptr<HybridPrivateKeySpec> HybridAccountFactory::privateKeyFromString(const std::string& privateKey) {
  void* rust_handle = private_key_from_string(privateKey.c_str());
  if (rust_handle == nullptr) {
    throw std::runtime_error("Failed to parse private key from string");
  }

  auto key = std::make_shared<HybridPrivateKey>();
  key->_setRustHandle(rust_handle);
  return key;
}

std::shared_ptr<HybridAddressSpec> HybridAccountFactory::addressFromString(const std::string& address) {
  void* rust_handle = address_from_string(address.c_str());
  if (rust_handle == nullptr) {
    throw std::runtime_error("Failed to parse address from string");
  }

  auto addr = std::make_shared<HybridAddress>();
  addr->_setRustHandle(rust_handle);
  return addr;
}

std::shared_ptr<HybridViewKeySpec> HybridAccountFactory::viewKeyFromString(const std::string& viewKey) {
  void* rust_handle = view_key_from_string(viewKey.c_str());
  if (rust_handle == nullptr) {
    throw std::runtime_error("Failed to parse view key from string");
  }

  auto key = std::make_shared<HybridViewKey>();
  key->_setRustHandle(rust_handle);
  return key;
}

} // namespace margelo::nitro::provable
