import { expect } from 'chai';
import { test, assertThrowsAsync } from '../util';
import { createAccount, type Account } from 'provable-mobile-sdk';

const SUITE = 'account';

// Get the Account module instance from Nitro
const getAccount = (): Account => {
  return createAccount();
};

// Test message for signing/verification
const TEST_MESSAGE = 'Hello, Provable Mobile SDK!';
const TEST_MESSAGE_BYTES = new TextEncoder().encode(TEST_MESSAGE);

// Known test vectors for deterministic testing
const KNOWN_PRIVATE_KEY = 'APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH';
const KNOWN_ADDRESS = 'aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px';
const KNOWN_VIEW_KEY = 'AViewKey1mSnpFFC8Mj4fXbK5YiWgZ3mjiV8CxA79bYNa8ymUpTrw';

test(SUITE, 'Account module instantiation', () => {
  const account = getAccount();
  expect(account).to.not.be.null;
  expect(account).to.not.be.undefined;
  expect(typeof account.createPrivateKey).to.equal('function');
  expect(typeof account.privateKeyFromString).to.equal('function');
  expect(typeof account.addressFromString).to.equal('function');
  expect(typeof account.viewKeyFromString).to.equal('function');
});

test(SUITE, 'Create new private key (RN->C++->Rust->C++->RN)', async () => {
  const account = getAccount();
  const privateKey = account.createPrivateKey();
  
  expect(privateKey).to.not.be.null;
  expect(privateKey).to.not.be.undefined;
  expect(typeof privateKey.toString).to.equal('function');
  expect(typeof privateKey.toAddress).to.equal('function');
  expect(typeof privateKey.toViewKey).to.equal('function');
  expect(typeof privateKey.sign).to.equal('function');
  
  // Test that we can get string representation
  const privateKeyString = await privateKey.toString();
  expect(privateKeyString).to.be.a('string');
  expect(privateKeyString.length).to.be.greaterThan(0);
  expect(privateKeyString).to.match(/^APrivateKey1/);
});

test(SUITE, 'Private key from string validation', async () => {
  const account = getAccount();
  
  // Valid private key should work
  const privateKey = account.privateKeyFromString(KNOWN_PRIVATE_KEY);
  expect(privateKey).to.not.be.null;
  
  const privateKeyString = await privateKey.toString();
  expect(privateKeyString).to.equal(KNOWN_PRIVATE_KEY);
  
  // Invalid private key should throw
  await assertThrowsAsync(
    async () => account.privateKeyFromString('invalid_private_key'),
    'Invalid private key format'
  );
});

test(SUITE, 'Address from string validation', async () => {
  const account = getAccount();
  
  // Valid address should work
  const address = account.addressFromString(KNOWN_ADDRESS);
  expect(address).to.not.be.null;
  
  const addressString = await address.toString();
  expect(addressString).to.equal(KNOWN_ADDRESS);
  
  // Invalid address should throw
  await assertThrowsAsync(
    async () => account.addressFromString('invalid_address'),
    'Invalid address format'
  );
});

test(SUITE, 'View key from string validation', async () => {
  const account = getAccount();
  
  // Valid view key should work
  const viewKey = account.viewKeyFromString(KNOWN_VIEW_KEY);
  expect(viewKey).to.not.be.null;
  
  const viewKeyString = await viewKey.toString();
  expect(viewKeyString).to.equal(KNOWN_VIEW_KEY);
  
  // Invalid view key should throw
  await assertThrowsAsync(
    async () => account.viewKeyFromString('invalid_view_key'),
    'Invalid view key format'
  );
});

test(SUITE, 'Private key to address conversion', async () => {
  const account = getAccount();
  const privateKey = account.privateKeyFromString(KNOWN_PRIVATE_KEY);
  
  const address = await privateKey.toAddress();
  expect(address).to.not.be.null;
  
  const addressString = await address.toString();
  expect(addressString).to.equal(KNOWN_ADDRESS);
});

test(SUITE, 'Private key to view key conversion', async () => {
  const account = getAccount();
  const privateKey = account.privateKeyFromString(KNOWN_PRIVATE_KEY);
  
  const viewKey = await privateKey.toViewKey();
  expect(viewKey).to.not.be.null;
  
  const viewKeyString = await viewKey.toString();
  expect(viewKeyString).to.equal(KNOWN_VIEW_KEY);
});

test(SUITE, 'View key to address conversion', async () => {
  const account = getAccount();
  const viewKey = account.viewKeyFromString(KNOWN_VIEW_KEY);
  
  const address = await viewKey.toAddress();
  expect(address).to.not.be.null;
  
  const addressString = await address.toString();
  expect(addressString).to.equal(KNOWN_ADDRESS);
});

test(SUITE, 'Sign and verify message (full bridge test)', async () => {
  const account = getAccount();
  const privateKey = account.privateKeyFromString(KNOWN_PRIVATE_KEY);
  const address = account.addressFromString(KNOWN_ADDRESS);
  
  // Create ArrayBuffer from test message
  const messageBuffer = new ArrayBuffer(TEST_MESSAGE_BYTES.length);
  const messageView = new Uint8Array(messageBuffer);
  messageView.set(TEST_MESSAGE_BYTES);
  
  // Sign the message (RN->C++->Rust signature generation)
  const signature = await privateKey.sign(messageBuffer);
  expect(signature).to.not.be.null;
  expect(signature.byteLength).to.be.greaterThan(0);
  
  // Verify the signature (RN->C++->Rust signature verification)
  const isValid = await address.verify(signature, messageBuffer);
  expect(isValid).to.be.true;
});

test(SUITE, 'Sign and verify with wrong address should fail', async () => {
  const account = getAccount();
  const privateKey = account.privateKeyFromString(KNOWN_PRIVATE_KEY);
  
  // Create a different private key and get its address
  const otherPrivateKey = account.createPrivateKey();
  const otherAddress = await otherPrivateKey.toAddress();
  
  // Create ArrayBuffer from test message
  const messageBuffer = new ArrayBuffer(TEST_MESSAGE_BYTES.length);
  const messageView = new Uint8Array(messageBuffer);
  messageView.set(TEST_MESSAGE_BYTES);
  
  // Sign with first private key
  const signature = await privateKey.sign(messageBuffer);
  
  // Try to verify with different address - should fail
  const isValid = await otherAddress.verify(signature, messageBuffer);
  expect(isValid).to.be.false;
});

test(SUITE, 'Sign and verify with tampered message should fail', async () => {
  const account = getAccount();
  const privateKey = account.privateKeyFromString(KNOWN_PRIVATE_KEY);
  const address = account.addressFromString(KNOWN_ADDRESS);
  
  // Create ArrayBuffer from test message
  const messageBuffer = new ArrayBuffer(TEST_MESSAGE_BYTES.length);
  const messageView = new Uint8Array(messageBuffer);
  messageView.set(TEST_MESSAGE_BYTES);
  
  // Sign the original message
  const signature = await privateKey.sign(messageBuffer);
  
  // Create a tampered message
  const tamperedMessage = 'Hello, Tampered Message!';
  const tamperedBytes = new TextEncoder().encode(tamperedMessage);
  const tamperedBuffer = new ArrayBuffer(tamperedBytes.length);
  const tamperedView = new Uint8Array(tamperedBuffer);
  tamperedView.set(tamperedBytes);
  
  // Try to verify signature against tampered message - should fail
  const isValid = await address.verify(signature, tamperedBuffer);
  expect(isValid).to.be.false;
});

test(SUITE, 'Multiple private key generation produces unique keys', async () => {
  const account = getAccount();
  
  const privateKey1 = account.createPrivateKey();
  const privateKey2 = account.createPrivateKey();
  
  const privateKeyString1 = await privateKey1.toString();
  const privateKeyString2 = await privateKey2.toString();
  
  expect(privateKeyString1).to.not.equal(privateKeyString2);
  
  // Ensure they produce different addresses
  const address1 = await privateKey1.toAddress();
  const address2 = await privateKey2.toAddress();
  
  const addressString1 = await address1.toString();
  const addressString2 = await address2.toString();
  
  expect(addressString1).to.not.equal(addressString2);
});

test(SUITE, 'ArrayBuffer handling with different sizes', async () => {
  const account = getAccount();
  const privateKey = account.createPrivateKey();
  const address = await privateKey.toAddress();
  
  // Test with different message sizes
  const testMessages = [
    'Short',
    'Medium length message for testing',
    'Very long message that spans multiple lines and contains various characters including numbers 123456789 and symbols !@#$%^&*()'
  ];
  
  for (const message of testMessages) {
    const messageBytes = new TextEncoder().encode(message);
    const messageBuffer = new ArrayBuffer(messageBytes.length);
    const messageView = new Uint8Array(messageBuffer);
    messageView.set(messageBytes);
    
    const signature = await privateKey.sign(messageBuffer);
    const isValid = await address.verify(signature, messageBuffer);
    
    expect(isValid).to.be.true;
  }
});

test(SUITE, 'Error handling for null/empty ArrayBuffers', async () => {
  const account = getAccount();
  const privateKey = account.createPrivateKey();
  const address = await privateKey.toAddress();
  
  // Test with empty ArrayBuffer
  const emptyBuffer = new ArrayBuffer(0);
  
  // Signing empty buffer should work (some cryptographic schemes allow this)
  const signature = await privateKey.sign(emptyBuffer);
  expect(signature).to.not.be.null;
  expect(signature.byteLength).to.be.greaterThan(0);
  
  // Verification should also work
  const isValid = await address.verify(signature, emptyBuffer);
  expect(isValid).to.be.true;
});

test(SUITE, 'Cross-validation: all derivation methods produce consistent results', async () => {
  const account = getAccount();
  
  // Start with a known private key
  const privateKey = account.privateKeyFromString(KNOWN_PRIVATE_KEY);
  
  // Get address and view key from private key
  const addressFromPrivateKey = await privateKey.toAddress();
  const viewKeyFromPrivateKey = await privateKey.toViewKey();
  
  // Get address from view key
  const addressFromViewKey = await viewKeyFromPrivateKey.toAddress();
  
  // All addresses should be the same
  const addressString1 = await addressFromPrivateKey.toString();
  const addressString2 = await addressFromViewKey.toString();
  
  expect(addressString1).to.equal(addressString2);
  expect(addressString1).to.equal(KNOWN_ADDRESS);
  
  // View key should match known value
  const viewKeyString = await viewKeyFromPrivateKey.toString();
  expect(viewKeyString).to.equal(KNOWN_VIEW_KEY);
});

test(SUITE, 'Memory management: multiple operations don\'t leak', async () => {
  const account = getAccount();
  
  // Perform many operations to test memory management
  for (let i = 0; i < 10; i++) {
    const privateKey = account.createPrivateKey();
    const address = await privateKey.toAddress();
    const viewKey = await privateKey.toViewKey();
    
    // Perform signing operation
    const messageBuffer = new ArrayBuffer(32);
    const messageView = new Uint8Array(messageBuffer);
    messageView.fill(i); // Fill with different values
    
    const signature = await privateKey.sign(messageBuffer);
    const isValid = await address.verify(signature, messageBuffer);
    
    expect(isValid).to.be.true;
    
    // Get string representations to ensure C++ objects are accessed
    await privateKey.toString();
    await address.toString();
    await viewKey.toString();
  }
});
