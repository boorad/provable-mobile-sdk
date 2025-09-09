#include "HybridPrivateKey.hpp"
#include "HybridAddress.hpp"
#include "HybridViewKey.hpp"
#include <NitroModules/ArrayBuffer.hpp>
#include <cstring>

// Forward declarations for Rust FFI functions
extern "C" {
char* private_key_to_string(const void* handle);
void* private_key_to_address(const void* handle);
void* private_key_to_view_key(const void* handle);
bool private_key_sign(const void* handle, const uint8_t* message, size_t message_len, void** signature_out);
void private_key_free(void* handle);
void free_c_string(char* s);
char* address_to_string(const void* handle);
void address_free(void* handle);
char* view_key_to_string(const void* handle);
void view_key_free(void* handle);
bool signature_to_bytes(const void* handle, uint8_t** bytes_out, size_t* len_out);
void signature_free(void* handle);
void free_bytes(uint8_t* ptr);
}

namespace margelo::nitro::provable {

HybridPrivateKey::~HybridPrivateKey() {
  if (_rustHandle != nullptr) {
    private_key_free(_rustHandle);
    _rustHandle = nullptr;
  }
}

std::string HybridPrivateKey::toString() {
  char* c_str = private_key_to_string(_rustHandle);
  if (c_str == nullptr) {
    throw std::runtime_error("Failed to convert private key to string");
  }

  std::string result(c_str);
  free_c_string(c_str);
  return result;
}

std::shared_ptr<HybridAddressSpec> HybridPrivateKey::toAddress() {
  void* address_handle = private_key_to_address(_rustHandle);
  if (address_handle == nullptr) {
    throw std::runtime_error("Failed to derive address from private key");
  }

  auto address = std::make_shared<HybridAddress>();
  address->_setRustHandle(address_handle);
  return address;
}

std::shared_ptr<HybridViewKeySpec> HybridPrivateKey::toViewKey() {
  void* view_key_handle = private_key_to_view_key(_rustHandle);
  if (view_key_handle == nullptr) {
    throw std::runtime_error("Failed to derive view key from private key");
  }

  auto viewKey = std::make_shared<HybridViewKey>();
  viewKey->_setRustHandle(view_key_handle);
  return viewKey;
}

std::shared_ptr<ArrayBuffer> HybridPrivateKey::sign(const std::shared_ptr<ArrayBuffer>& message) {
  if (message == nullptr) {
    throw std::runtime_error("Message cannot be null");
  }

  const uint8_t* message_data = message->data();
  size_t message_len = message->size();

  void* signature_handle = nullptr;
  bool success = private_key_sign(_rustHandle, message_data, message_len, &signature_handle);

  if (!success || signature_handle == nullptr) {
    throw std::runtime_error("Failed to sign message");
  }

  uint8_t* signature_bytes = nullptr;
  size_t signature_len = 0;
  bool bytes_success = signature_to_bytes(signature_handle, &signature_bytes, &signature_len);
  signature_free(signature_handle);

  if (!bytes_success || signature_bytes == nullptr) {
    throw std::runtime_error("Failed to serialize signature");
  }

  auto result = ArrayBuffer::allocate(signature_len);
  std::memcpy(result->data(), signature_bytes, signature_len);
  free_bytes(signature_bytes);

  return result;
}

} // namespace margelo::nitro::provable
