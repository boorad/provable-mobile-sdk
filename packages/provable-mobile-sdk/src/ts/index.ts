export type { HybridObject } from "react-native-nitro-modules";
export type {
  Account,
  Address,
  PrivateKey,
  ViewKey,
} from "./specs/account.nitro";

import type { Account, Address, PrivateKey, ViewKey } from "./specs/account.nitro";

export const createAccount = (): Account => {
  throw new Error("Account must be instantiated through Nitro module system");
};

export const createPrivateKey = (): PrivateKey => {
  const account = createAccount();
  return account.createPrivateKey();
};

export const privateKeyFromString = (privateKeyString: string): PrivateKey => {
  const account = createAccount();
  return account.privateKeyFromString(privateKeyString);
};

export const addressFromString = (addressString: string): Address => {
  const account = createAccount();
  return account.addressFromString(addressString);
};

export const viewKeyFromString = (viewKeyString: string): ViewKey => {
  const account = createAccount();
  return account.viewKeyFromString(viewKeyString);
};
