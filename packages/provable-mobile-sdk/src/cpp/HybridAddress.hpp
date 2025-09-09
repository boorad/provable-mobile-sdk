#pragma once

#include "HybridAddressSpec.hpp"
#include <memory>

namespace margelo::nitro::provable {

class HybridAddress : public HybridAddressSpec {
 public:
  HybridAddress() : HybridObject(TAG) {}
  ~HybridAddress();

  // HybridAddressSpec implementation
  std::string toString() override;
  bool verify(const std::shared_ptr<ArrayBuffer>& signature, const std::shared_ptr<ArrayBuffer>& message) override;

 private:
  void* _rustHandle = nullptr;
  friend class HybridPrivateKey;     // Allow PrivateKey to set handle
  friend class HybridViewKey;        // Allow ViewKey to set handle
  friend class HybridAccountFactory; // Allow factory to set handle
  void _setRustHandle(void* handle) {
    _rustHandle = handle;
  }
};

} // namespace margelo::nitro::provable
