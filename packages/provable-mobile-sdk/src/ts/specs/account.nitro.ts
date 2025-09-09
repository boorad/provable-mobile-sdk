import type { HybridObject } from "react-native-nitro-modules";

export interface PrivateKey extends HybridObject<{ ios: "c++"; android: "c++" }> {
  // Get a string representation of the private key
  toString(): string;

  // Get the address corresponding to the private key
  toAddress(): Address;

  // Get the view key corresponding to the private key
  toViewKey(): ViewKey;

  // Sign a message with the private key
  sign(message: ArrayBuffer): ArrayBuffer;
}

export interface Address extends HybridObject<{ ios: "c++"; android: "c++" }> {
  // Get a string representation of the address
  toString(): string;

  // Verify a signature against this address
  verify(signature: ArrayBuffer, message: ArrayBuffer): boolean;
}

export interface ViewKey extends HybridObject<{ ios: "c++"; android: "c++" }> {
  // Get a string representation of the view key
  toString(): string;

  // Get the address corresponding to the view key
  toAddress(): Address;
}

// Factory interface for creating account objects
export interface AccountFactory extends HybridObject<{ ios: "c++"; android: "c++" }> {
  // Generate a new private key using a cryptographically secure random number generator
  createPrivateKey(): PrivateKey;

  // Get a private key from a string representation
  privateKeyFromString(privateKey: string): PrivateKey;

  // Get an address from a string representation
  addressFromString(address: string): Address;

  // Get a view key from a string representation
  viewKeyFromString(viewKey: string): ViewKey;
}
