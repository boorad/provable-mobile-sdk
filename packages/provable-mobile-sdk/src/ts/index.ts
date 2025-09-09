export type { HybridObject } from "react-native-nitro-modules";
export type {
  Account,
  Address,
  PrivateKey,
  ViewKey,
} from "./specs/account.nitro";

import { NitroModules } from "react-native-nitro-modules";
import type { Account, Address, PrivateKey, ViewKey } from "./specs/account.nitro";

export const createAccount = (): Account => {
  return NitroModules.createHybridObject<Account>("Account");
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
