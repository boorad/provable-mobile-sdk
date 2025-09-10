#include "HybridAccount.hpp"
#include <NitroModules/ArrayBuffer.hpp>
#include <NitroModules/Promise.hpp>
#include <cstring>
#include <vector>

// Include generated struct headers
#include "PrivateKey.hpp"
#include "Address.hpp"
#include "ViewKey.hpp"

// Include generated Rust cxx bridge header
#include "rust/lib.rs.h"

using namespace NitroModules;
using namespace margelo::nitro::provable;

namespace margelo::nitro::provable {

// Rust FFI wrapper implementations using cxx bridge
std::string HybridAccount::rustCreatePrivateKey() {
  auto handle = create_private_key();
  auto result = private_key_to_string(handle);
  destroy_private_key(handle);
  
  if (result.success) {
    return std::string(result.result);
  } else {
    throw std::runtime_error(std::string(result.error));
  }
}

bool HybridAccount::rustValidatePrivateKey(const std::string& privateKey) {
  return validate_private_key(rust::String(privateKey));
}

std::string HybridAccount::rustPrivateKeyToAddress(const std::string& privateKey) {
  auto pkHandle = private_key_from_string(rust::String(privateKey));
  if (pkHandle.id == 0) {
    throw std::invalid_argument("Invalid private key");
  }
  
  auto addrHandle = private_key_to_address(pkHandle);
  auto result = address_to_string(addrHandle);
  
  destroy_private_key(pkHandle);
  destroy_address(addrHandle);
  
  if (result.success) {
    return std::string(result.result);
  } else {
    throw std::runtime_error(std::string(result.error));
  }
}

std::string HybridAccount::rustPrivateKeyToViewKey(const std::string& privateKey) {
  auto pkHandle = private_key_from_string(rust::String(privateKey));
  if (pkHandle.id == 0) {
    throw std::invalid_argument("Invalid private key");
  }
  
  auto vkHandle = private_key_to_view_key(pkHandle);
  auto result = view_key_to_string(vkHandle);
  
  destroy_private_key(pkHandle);
  destroy_view_key(vkHandle);
  
  if (result.success) {
    return std::string(result.result);
  } else {
    throw std::runtime_error(std::string(result.error));
  }
}

std::shared_ptr<ArrayBuffer> HybridAccount::rustPrivateKeySign(const std::string& privateKey, const uint8_t* message,
                                                                             size_t messageLen) {
  auto pkHandle = private_key_from_string(rust::String(privateKey));
  if (pkHandle.id == 0) {
    throw std::invalid_argument("Invalid private key");
  }
  
  // Convert message to rust::Vec<uint8_t>
  rust::Vec<uint8_t> messageVec;
  for (size_t i = 0; i < messageLen; ++i) {
    messageVec.push_back(message[i]);
  }

  auto result = private_key_sign(pkHandle, messageVec);
  destroy_private_key(pkHandle);
  
  if (result.success) {
    auto buffer = ArrayBuffer::allocate(result.signature_bytes.size());
    std::memcpy(buffer->data(), result.signature_bytes.data(), result.signature_bytes.size());
    return buffer;
  } else {
    throw std::runtime_error(std::string(result.error));
  }
}

bool HybridAccount::rustValidateAddress(const std::string& address) {
  return validate_address(rust::String(address));
}

bool HybridAccount::rustAddressVerify(const std::string& address, const uint8_t* signature, size_t signatureLen, const uint8_t* message,
                                      size_t messageLen) {
  auto addrHandle = address_from_string(rust::String(address));
  if (addrHandle.id == 0) {
    return false;
  }
  
  // Convert signature and message to rust::Vec<uint8_t>
  rust::Vec<uint8_t> signatureVec;
  for (size_t i = 0; i < signatureLen; ++i) {
    signatureVec.push_back(signature[i]);
  }
  
  rust::Vec<uint8_t> messageVec;
  for (size_t i = 0; i < messageLen; ++i) {
    messageVec.push_back(message[i]);
  }

  bool result = address_verify(addrHandle, signatureVec, messageVec);
  destroy_address(addrHandle);
  return result;
}

bool HybridAccount::rustValidateViewKey(const std::string& viewKey) {
  return validate_view_key(rust::String(viewKey));
}

std::string HybridAccount::rustViewKeyToAddress(const std::string& viewKey) {
  auto vkHandle = view_key_from_string(rust::String(viewKey));
  if (vkHandle.id == 0) {
    throw std::invalid_argument("Invalid view key");
  }
  
  auto addrHandle = view_key_to_address(vkHandle);
  auto result = address_to_string(addrHandle);
  
  destroy_view_key(vkHandle);
  destroy_address(addrHandle);
  
  if (result.success) {
    return std::string(result.result);
  } else {
    throw std::runtime_error(std::string(result.error));
  }
}

// Create PrivateKey struct with bound functions
PrivateKey HybridAccount::createPrivateKeyStruct(const std::string& privateKeyString) {
  return PrivateKey(
      // toString function
      [privateKeyString]() -> std::shared_ptr<Promise<std::string>> {
        return Promise<std::string>::resolved(std::string(privateKeyString));
      },
      // toAddress function
      [this, privateKeyString]() -> std::shared_ptr<Promise<Address>> {
        std::string addressString = rustPrivateKeyToAddress(privateKeyString);
        Address address = createAddressStruct(addressString);
        return Promise<Address>::resolved(std::move(address));
      },
      // toViewKey function
      [this, privateKeyString]() -> std::shared_ptr<Promise<ViewKey>> {
        std::string viewKeyString = rustPrivateKeyToViewKey(privateKeyString);
        ViewKey viewKey = createViewKeyStruct(viewKeyString);
        return Promise<ViewKey>::resolved(std::move(viewKey));
      },
      // sign function
      [this, privateKeyString](const std::shared_ptr<ArrayBuffer>& message) -> std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> {
        auto signature = rustPrivateKeySign(privateKeyString, message->data(), message->size());
        return Promise<std::shared_ptr<ArrayBuffer>>::resolved(std::move(signature));
      });
}

// Create Address struct with bound functions
Address HybridAccount::createAddressStruct(const std::string& addressString) {
  return Address(
      // toString function
      [addressString]() -> std::shared_ptr<Promise<std::string>> {
        return Promise<std::string>::resolved(std::string(addressString));
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
        return Promise<std::string>::resolved(std::string(viewKeyString));
      },
      // toAddress function
      [this, viewKeyString]() -> std::shared_ptr<Promise<Address>> {
        std::string addressString = rustViewKeyToAddress(viewKeyString);
        Address address = createAddressStruct(addressString);
        return Promise<Address>::resolved(std::move(address));
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
