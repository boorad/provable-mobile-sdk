import type { HybridObject } from "react-native-nitro-modules";

// Value objects - plain interfaces for efficient struct conversion
export interface PrivateKey {
  // Get a string representation of the private key
  toString(): string;

  // Get the address corresponding to the private key
  toAddress(): Address;

  // Get the view key corresponding to the private key
  toViewKey(): ViewKey;

  // Sign a message with the private key
  sign(message: ArrayBuffer): ArrayBuffer;
}

export interface Address {
  // Get a string representation of the address
  toString(): string;

  // Verify a signature against this address
  verify(signature: ArrayBuffer, message: ArrayBuffer): boolean;
}

export interface ViewKey {
  // Get a string representation of the view key
  toString(): string;

  // Get the address corresponding to the view key
  toAddress(): Address;
}

// Account utilities - static methods for creating account objects
export interface Account extends HybridObject<{ ios: "c++"; android: "c++" }> {
  // Generate a new private key using a cryptographically secure random number generator
  createPrivateKey(): PrivateKey;

  // Get a private key from a string representation
  privateKeyFromString(privateKey: string): PrivateKey;

  // Get an address from a string representation
  addressFromString(address: string): Address;

  // Get a view key from a string representation
  viewKeyFromString(viewKey: string): ViewKey;

  // Get an address from a private key
  addressFromPrivateKey(privateKey: PrivateKey): Address;

  // Get a view key from a private key
  viewKeyFromPrivateKey(privateKey: PrivateKey): ViewKey;

  // Get an address from a view key
  addressFromViewKey(viewKey: ViewKey): Address;
}
