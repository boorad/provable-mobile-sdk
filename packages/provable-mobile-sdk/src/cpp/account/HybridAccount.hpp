#pragma once

#include "HybridAccountSpec.hpp"
#include <NitroModules/ArrayBuffer.hpp>

namespace margelo::nitro::provable {

class HybridAccount : public HybridAccountSpec {
 public:
  explicit HybridAccount() : HybridAccountSpec() {}

  // Account creation methods
  PrivateKey createPrivateKey() override;
  PrivateKey privateKeyFromString(const std::string& privateKey) override;
  Address addressFromString(const std::string& address) override;
  ViewKey viewKeyFromString(const std::string& viewKey) override;

  // Conversion methods
  Address addressFromPrivateKey(const PrivateKey& privateKey) override;
  ViewKey viewKeyFromPrivateKey(const PrivateKey& privateKey) override;
  Address addressFromViewKey(const ViewKey& viewKey) override;

 private:
  // Helper methods to create structs with bound functions
  PrivateKey createPrivateKeyStruct(const std::string& privateKeyString);
  Address createAddressStruct(const std::string& addressString);
  ViewKey createViewKeyStruct(const std::string& viewKeyString);

  // Rust FFI wrapper functions
  std::string rustCreatePrivateKey();
  bool rustValidatePrivateKey(const std::string& privateKey);
  std::string rustPrivateKeyToAddress(const std::string& privateKey);
  std::string rustPrivateKeyToViewKey(const std::string& privateKey);
  std::shared_ptr<ArrayBuffer> rustPrivateKeySign(const std::string& privateKey, const uint8_t* message, size_t messageLen);

  bool rustValidateAddress(const std::string& address);
  bool rustAddressVerify(const std::string& address, const uint8_t* signature, size_t signatureLen, const uint8_t* message,
                         size_t messageLen);

  bool rustValidateViewKey(const std::string& viewKey);
  std::string rustViewKeyToAddress(const std::string& viewKey);
};

} // namespace margelo::nitro::provable
