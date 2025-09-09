#include "HybridViewKey.hpp"
#include "HybridAddress.hpp"

// Forward declarations for Rust FFI functions
extern "C" {
char* view_key_to_string(const void* handle);
void* view_key_to_address(const void* handle);
void view_key_free(void* handle);
void free_c_string(char* s);
}

namespace margelo::nitro::provable {

HybridViewKey::~HybridViewKey() {
  if (_rustHandle != nullptr) {
    view_key_free(_rustHandle);
    _rustHandle = nullptr;
  }
}

std::string HybridViewKey::toString() {
  if (_rustHandle == nullptr) {
    throw std::runtime_error("ViewKey not initialized");
  }

  char* c_str = view_key_to_string(_rustHandle);
  if (c_str == nullptr) {
    throw std::runtime_error("Failed to convert view key to string");
  }

  std::string result(c_str);
  free_c_string(c_str);
  return result;
}

std::shared_ptr<HybridAddressSpec> HybridViewKey::toAddress() {
  if (_rustHandle == nullptr) {
    throw std::runtime_error("ViewKey not initialized");
  }

  void* address_handle = view_key_to_address(_rustHandle);
  if (address_handle == nullptr) {
    throw std::runtime_error("Failed to derive address from view key");
  }

  auto address = std::make_shared<HybridAddress>();
  address->_setRustHandle(address_handle);
  return address;
}

} // namespace margelo::nitro::provable
