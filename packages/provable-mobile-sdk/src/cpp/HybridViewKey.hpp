#pragma once

#include "HybridViewKeySpec.hpp"
#include <memory>

namespace margelo::nitro::provable {

class HybridViewKey : public HybridViewKeySpec {
 public:
  HybridViewKey() : HybridObject(TAG) {}
  ~HybridViewKey();

  // HybridViewKeySpec implementation
  std::string toString() override;
  std::shared_ptr<HybridAddressSpec> toAddress() override;

 private:
  void* _rustHandle = nullptr;
  friend class HybridPrivateKey;     // Allow PrivateKey to set handle
  friend class HybridAccountFactory; // Allow factory to set handle
  void _setRustHandle(void* handle) {
    _rustHandle = handle;
  }
};

} // namespace margelo::nitro::provable
