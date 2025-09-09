#pragma once

#include "HybridPrivateKeySpec.hpp"
#include <memory>

namespace margelo::nitro::provable {

class HybridPrivateKey : public HybridPrivateKeySpec {
 public:
  HybridPrivateKey() : HybridObject(TAG) {}
  ~HybridPrivateKey();

  // HybridPrivateKeySpec implementation
  std::string toString() override;
  std::shared_ptr<HybridAddressSpec> toAddress() override;
  std::shared_ptr<HybridViewKeySpec> toViewKey() override;
  std::shared_ptr<ArrayBuffer> sign(const std::shared_ptr<ArrayBuffer>& message) override;

 private:
  void* _rustHandle = nullptr;
  friend class HybridAccountFactory; // Allow factory to set handle
  void _setRustHandle(void* handle) {
    _rustHandle = handle;
  }
};

} // namespace margelo::nitro::provable
