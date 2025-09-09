#include "HybridAddress.hpp"
#include <NitroModules/ArrayBuffer.hpp>

// Forward declarations for Rust FFI functions
extern "C" {
char* address_to_string(const void* handle);
bool address_verify(const void* handle, const void* signature_handle, const uint8_t* message, size_t message_len);
void address_free(void* handle);
void free_c_string(char* s);
void* signature_from_bytes(const uint8_t* bytes, size_t len);
void signature_free(void* handle);
}

namespace margelo::nitro::provable {

HybridAddress::~HybridAddress() {
  if (_rustHandle != nullptr) {
    address_free(_rustHandle);
    _rustHandle = nullptr;
  }
}

std::string HybridAddress::toString() {
  if (_rustHandle == nullptr) {
    throw std::runtime_error("Address not initialized");
  }

  char* c_str = address_to_string(_rustHandle);
  if (c_str == nullptr) {
    throw std::runtime_error("Failed to convert address to string");
  }

  std::string result(c_str);
  free_c_string(c_str);
  return result;
}

bool HybridAddress::verify(const std::shared_ptr<ArrayBuffer>& signature, const std::shared_ptr<ArrayBuffer>& message) {
  if (signature == nullptr || message == nullptr) {
    return false;
  }

  // For now, we'll need to reconstruct the signature from bytes
  // This is a simplified implementation - in practice, we'd need proper signature deserialization
  const uint8_t* signature_data = signature->data();
  size_t signature_len = signature->size();
  const uint8_t* message_data = message->data();
  size_t message_len = message->size();

  // Create signature handle from bytes (this would need proper implementation)
  void* signature_handle = signature_from_bytes(signature_data, signature_len);
  if (signature_handle == nullptr) {
    return false;
  }

  bool result = address_verify(_rustHandle, signature_handle, message_data, message_len);
  signature_free(signature_handle);

  return result;
}

} // namespace margelo::nitro::provable
