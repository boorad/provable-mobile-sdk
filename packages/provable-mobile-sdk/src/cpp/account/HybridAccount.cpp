#include "HybridAccount.hpp"
#include <NitroModules/ArrayBuffer.hpp>
#include <NitroModules/Promise.hpp>
#include <cstring>
#include <vector>

// Include generated struct headers
#include "PrivateKey.hpp"
#include "Address.hpp"
#include "ViewKey.hpp"

using namespace NitroModules;
using namespace margelo::nitro::provable;

// Rust FFI declarations
extern "C" {
char* rust_create_private_key();
bool rust_validate_private_key(const char* private_key);
char* rust_private_key_to_address(const char* private_key);
char* rust_private_key_to_view_key(const char* private_key);
uint8_t* rust_private_key_sign(const char* private_key, const uint8_t* message, size_t message_len, size_t* signature_len);

bool rust_validate_address(const char* address);
bool rust_address_verify(const char* address, const uint8_t* signature, size_t signature_len, const uint8_t* message, size_t message_len);

bool rust_validate_view_key(const char* view_key);
char* rust_view_key_to_address(const char* view_key);

void rust_free_string(char* ptr);
void rust_free_bytes(uint8_t* ptr);
}

namespace margelo::nitro::provable {

// Rust FFI wrapper implementations
std::string HybridAccount::rustCreatePrivateKey() {
  char* result = ::rust_create_private_key();
  std::string privateKey(result);
  ::rust_free_string(result);
  return privateKey;
}

bool HybridAccount::rustValidatePrivateKey(const std::string& privateKey) {
  return ::rust_validate_private_key(privateKey.c_str());
}

std::string HybridAccount::rustPrivateKeyToAddress(const std::string& privateKey) {
  char* result = ::rust_private_key_to_address(privateKey.c_str());
  std::string address(result);
  ::rust_free_string(result);
  return address;
}

std::string HybridAccount::rustPrivateKeyToViewKey(const std::string& privateKey) {
  char* result = ::rust_private_key_to_view_key(privateKey.c_str());
  std::string viewKey(result);
  ::rust_free_string(result);
  return viewKey;
}

std::shared_ptr<ArrayBuffer> HybridAccount::rustPrivateKeySign(const std::string& privateKey, const uint8_t* message,
                                                                             size_t messageLen) {
  size_t signatureLen;
  uint8_t* signatureData = ::rust_private_key_sign(privateKey.c_str(), message, messageLen, &signatureLen);

  auto buffer = std::make_shared<ArrayBuffer>(signatureLen);
  std::memcpy(buffer->data(), signatureData, signatureLen);

  ::rust_free_bytes(signatureData);
  return buffer;
}

bool HybridAccount::rustValidateAddress(const std::string& address) {
  return ::rust_validate_address(address.c_str());
}

bool HybridAccount::rustAddressVerify(const std::string& address, const uint8_t* signature, size_t signatureLen, const uint8_t* message,
                                      size_t messageLen) {
  return ::rust_address_verify(address.c_str(), signature, signatureLen, message, messageLen);
}

bool HybridAccount::rustValidateViewKey(const std::string& viewKey) {
  return ::rust_validate_view_key(viewKey.c_str());
}

std::string HybridAccount::rustViewKeyToAddress(const std::string& viewKey) {
  char* result = ::rust_view_key_to_address(viewKey.c_str());
  std::string address(result);
  ::rust_free_string(result);
  return address;
}

// Create PrivateKey struct with bound functions
PrivateKey HybridAccount::createPrivateKeyStruct(const std::string& privateKeyString) {
  return PrivateKey(
      // toString function
      [privateKeyString]() -> std::shared_ptr<Promise<std::string>> {
        auto promise = std::make_shared<Promise<std::string>>();
        promise->resolve(privateKeyString);
        return promise;
      },
      // toAddress function
      [this, privateKeyString]() -> std::shared_ptr<Promise<Address>> {
        auto promise = std::make_shared<Promise<Address>>();
        std::string addressString = rustPrivateKeyToAddress(privateKeyString);
        Address address = createAddressStruct(addressString);
        promise->resolve(address);
        return promise;
      },
      // toViewKey function
      [this, privateKeyString]() -> std::shared_ptr<Promise<ViewKey>> {
        auto promise = std::make_shared<Promise<ViewKey>>();
        std::string viewKeyString = rustPrivateKeyToViewKey(privateKeyString);
        ViewKey viewKey = createViewKeyStruct(viewKeyString);
        promise->resolve(viewKey);
        return promise;
      },
      // sign function
      [this, privateKeyString](const std::shared_ptr<ArrayBuffer>& message) -> std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> {
        auto promise = std::make_shared<Promise<std::shared_ptr<ArrayBuffer>>>();
        auto signature = rustPrivateKeySign(privateKeyString, message->data(), message->size());
        promise->resolve(signature);
        return promise;
      });
}

// Create Address struct with bound functions
Address HybridAccount::createAddressStruct(const std::string& addressString) {
  return Address(
      // toString function
      [addressString]() -> std::shared_ptr<Promise<std::string>> {
        return Promise<std::string>::async([addressString]() { return addressString; });
      },
      // verify function
      [this, addressString](const std::shared_ptr<ArrayBuffer>& signature,
                            const std::shared_ptr<ArrayBuffer>& message) -> std::shared_ptr<Promise<bool>> {
        // Copy buffer data for async operation (non-owning buffers)
        std::vector<uint8_t> sigData(signature->data(), signature->data() + signature->size());
        std::vector<uint8_t> msgData(message->data(), message->data() + message->size());
        return Promise<bool>::async([this, addressString, sigData, msgData]() -> bool {
          return rustAddressVerify(addressString, sigData.data(), sigData.size(), msgData.data(), msgData.size());
        });
      });
}

// Create ViewKey struct with bound functions
ViewKey HybridAccount::createViewKeyStruct(const std::string& viewKeyString) {
  return ViewKey(
      // toString function
      [viewKeyString]() -> std::shared_ptr<Promise<std::string>> {
        return Promise<std::string>::async([viewKeyString]() { return viewKeyString; });
      },
      // toAddress function
      [this, viewKeyString]() -> std::shared_ptr<Promise<Address>> {
        return Promise<Address>::async([this, viewKeyString]() {
          std::string addressString = rustViewKeyToAddress(viewKeyString);
          return createAddressStruct(addressString);
        });
      });
}

// Account creation methods
PrivateKey HybridAccount::createPrivateKey() {
  std::string privateKeyString = rustCreatePrivateKey();
  return createPrivateKeyStruct(privateKeyString);
}

PrivateKey HybridAccount::privateKeyFromString(const std::string& privateKey) {
  if (!rustValidatePrivateKey(privateKey)) {
    throw std::invalid_argument("Invalid private key format");
  }
  return createPrivateKeyStruct(privateKey);
}

Address HybridAccount::addressFromString(const std::string& address) {
  if (!rustValidateAddress(address)) {
    throw std::invalid_argument("Invalid address format");
  }
  return createAddressStruct(address);
}

ViewKey HybridAccount::viewKeyFromString(const std::string& viewKey) {
  if (!rustValidateViewKey(viewKey)) {
    throw std::invalid_argument("Invalid view key format");
  }
  return createViewKeyStruct(viewKey);
}

// Conversion methods
Address HybridAccount::addressFromPrivateKey(const PrivateKey& privateKey) {
  throw std::runtime_error("Cannot access synchronous methods on Nitro structs - use privateKey.toAddress() instead");
}

ViewKey HybridAccount::viewKeyFromPrivateKey(const PrivateKey& privateKey) {
  throw std::runtime_error("Cannot access synchronous methods on Nitro structs - use privateKey.toViewKey() instead");
}

Address HybridAccount::addressFromViewKey(const ViewKey& viewKey) {
  throw std::runtime_error("Cannot access synchronous methods on Nitro structs - use viewKey.toAddress() instead");
}

} // namespace margelo::nitro::provable
