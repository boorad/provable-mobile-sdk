#pragma once

#include "HybridAccountFactorySpec.hpp"

namespace margelo::nitro::provable {

class HybridAccountFactory : public HybridAccountFactorySpec {
 public:
  HybridAccountFactory() : HybridObject(TAG) {}

  // HybridAccountFactorySpec implementation
  std::shared_ptr<HybridPrivateKeySpec> createPrivateKey() override;
  std::shared_ptr<HybridPrivateKeySpec> privateKeyFromString(const std::string& privateKey) override;
  std::shared_ptr<HybridAddressSpec> addressFromString(const std::string& address) override;
  std::shared_ptr<HybridViewKeySpec> viewKeyFromString(const std::string& viewKey) override;
};

} // namespace margelo::nitro::provable
