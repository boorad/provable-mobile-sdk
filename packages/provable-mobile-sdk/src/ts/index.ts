export type { HybridObject } from "react-native-nitro-modules";
export type {
  AccountFactory,
  Address,
  PrivateKey,
  ViewKey,
} from "./specs/account.nitro";

import type { AccountFactory, Address, PrivateKey, ViewKey } from "./specs/account.nitro";

export const createAccountFactory = (): AccountFactory => {
  throw new Error("AccountFactory must be instantiated through Nitro module system");
};

export const createPrivateKey = (): PrivateKey => {
  const factory = createAccountFactory();
  return factory.createPrivateKey();
};

export const privateKeyFromString = (privateKeyString: string): PrivateKey => {
  const factory = createAccountFactory();
  return factory.privateKeyFromString(privateKeyString);
};

export const addressFromString = (addressString: string): Address => {
  const factory = createAccountFactory();
  return factory.addressFromString(addressString);
};

export const viewKeyFromString = (viewKeyString: string): ViewKey => {
  const factory = createAccountFactory();
  return factory.viewKeyFromString(viewKeyString);
};
