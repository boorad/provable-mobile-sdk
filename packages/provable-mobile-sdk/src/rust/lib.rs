use std::collections::HashMap;
use std::sync::{Mutex, OnceLock};
use std::str::FromStr;
use snarkvm_console::{
    account::{Address, PrivateKey, Signature, ViewKey},
    network::MainnetV0,
    prelude::{FromBytes, ToBytes},
};

type CurrentNetwork = MainnetV0;

#[cxx::bridge]
mod ffi {
    // Shared types between Rust and C++
    struct PrivateKeyHandle {
        id: u64,
    }

    struct AddressHandle {
        id: u64,
    }

    struct ViewKeyHandle {
        id: u64,
    }

    struct SignatureHandle {
        id: u64,
    }

    struct AccountResult {
        success: bool,
        result: String,
        error: String,
    }

    struct SignatureResult {
        success: bool,
        signature_bytes: Vec<u8>,
        error: String,
    }

    // Rust functions exposed to C++
    extern "Rust" {
        fn create_private_key() -> PrivateKeyHandle;
        fn private_key_from_string(private_key_str: String) -> PrivateKeyHandle;
        fn private_key_to_string(handle: &PrivateKeyHandle) -> AccountResult;
        fn private_key_to_address(handle: &PrivateKeyHandle) -> AddressHandle;
        fn private_key_to_view_key(handle: &PrivateKeyHandle) -> ViewKeyHandle;
        fn private_key_sign(handle: &PrivateKeyHandle, message: Vec<u8>) -> SignatureResult;
        fn validate_private_key(private_key_str: String) -> bool;
        fn destroy_private_key(handle: &PrivateKeyHandle);

        fn address_from_string(address_str: String) -> AddressHandle;
        fn address_to_string(handle: &AddressHandle) -> AccountResult;
        fn address_verify(handle: &AddressHandle, signature_bytes: Vec<u8>, message: Vec<u8>) -> bool;
        fn validate_address(address_str: String) -> bool;
        fn destroy_address(handle: &AddressHandle);

        fn view_key_from_string(view_key_str: String) -> ViewKeyHandle;
        fn view_key_to_string(handle: &ViewKeyHandle) -> AccountResult;
        fn view_key_to_address(handle: &ViewKeyHandle) -> AddressHandle;
        fn validate_view_key(view_key_str: String) -> bool;
        fn destroy_view_key(handle: &ViewKeyHandle);

        fn destroy_signature(handle: &SignatureHandle);
    }
}

// Storage for cryptographic objects using handles
static PRIVATE_KEYS: OnceLock<Mutex<HashMap<u64, PrivateKey<CurrentNetwork>>>> = OnceLock::new();
static ADDRESSES: OnceLock<Mutex<HashMap<u64, Address<CurrentNetwork>>>> = OnceLock::new();
static VIEW_KEYS: OnceLock<Mutex<HashMap<u64, ViewKey<CurrentNetwork>>>> = OnceLock::new();
static SIGNATURES: OnceLock<Mutex<HashMap<u64, Signature<CurrentNetwork>>>> = OnceLock::new();
static NEXT_ID: Mutex<u64> = Mutex::new(1);

// Initialize storage
fn ensure_private_key_storage() -> &'static Mutex<HashMap<u64, PrivateKey<CurrentNetwork>>> {
    PRIVATE_KEYS.get_or_init(|| Mutex::new(HashMap::new()))
}

fn ensure_address_storage() -> &'static Mutex<HashMap<u64, Address<CurrentNetwork>>> {
    ADDRESSES.get_or_init(|| Mutex::new(HashMap::new()))
}

fn ensure_view_key_storage() -> &'static Mutex<HashMap<u64, ViewKey<CurrentNetwork>>> {
    VIEW_KEYS.get_or_init(|| Mutex::new(HashMap::new()))
}

fn ensure_signature_storage() -> &'static Mutex<HashMap<u64, Signature<CurrentNetwork>>> {
    SIGNATURES.get_or_init(|| Mutex::new(HashMap::new()))
}

// Get the next unique ID
fn get_next_id() -> u64 {
    let mut id = NEXT_ID.lock().unwrap();
    let current = *id;
    *id += 1;
    current
}

// Helper functions to create results
fn error_result(error: String) -> ffi::AccountResult {
    ffi::AccountResult {
        success: false,
        result: String::new(),
        error,
    }
}

fn success_result(result: String) -> ffi::AccountResult {
    ffi::AccountResult {
        success: true,
        result,
        error: String::new(),
    }
}

fn signature_error_result(error: String) -> ffi::SignatureResult {
    ffi::SignatureResult {
        success: false,
        signature_bytes: Vec::new(),
        error,
    }
}

fn signature_success_result(signature_bytes: Vec<u8>) -> ffi::SignatureResult {
    ffi::SignatureResult {
        success: true,
        signature_bytes,
        error: String::new(),
    }
}

// FFI function implementations

// Private key functions
pub fn create_private_key() -> ffi::PrivateKeyHandle {
    let private_key = PrivateKey::<CurrentNetwork>::new(&mut rand::thread_rng()).unwrap();
    let id = get_next_id();
    
    let storage = ensure_private_key_storage();
    let mut map = storage.lock().unwrap();
    map.insert(id, private_key);
    
    ffi::PrivateKeyHandle { id }
}

pub fn private_key_from_string(private_key_str: String) -> ffi::PrivateKeyHandle {
    match PrivateKey::<CurrentNetwork>::from_str(&private_key_str) {
        Ok(private_key) => {
            let id = get_next_id();
            let storage = ensure_private_key_storage();
            let mut keys = storage.lock().unwrap();
            keys.insert(id, private_key);
            ffi::PrivateKeyHandle { id }
        }
        Err(_) => ffi::PrivateKeyHandle { id: 0 }, // Invalid handle
    }
}

pub fn private_key_to_string(handle: &ffi::PrivateKeyHandle) -> ffi::AccountResult {
    let storage = ensure_private_key_storage();
    let keys = storage.lock().unwrap();
    
    if let Some(key) = keys.get(&handle.id) {
        success_result(key.to_string())
    } else {
        error_result("Invalid private key handle".to_string())
    }
}

pub fn private_key_to_address(handle: &ffi::PrivateKeyHandle) -> ffi::AddressHandle {
    let storage = ensure_private_key_storage();
    let keys = storage.lock().unwrap();
    
    if let Some(key) = keys.get(&handle.id) {
        let address = Address::<CurrentNetwork>::try_from(key).unwrap();
        let id = get_next_id();
        let addr_storage = ensure_address_storage();
        let mut addresses = addr_storage.lock().unwrap();
        addresses.insert(id, address);
        ffi::AddressHandle { id }
    } else {
        ffi::AddressHandle { id: 0 } // Invalid handle
    }
}

pub fn private_key_to_view_key(handle: &ffi::PrivateKeyHandle) -> ffi::ViewKeyHandle {
    let storage = ensure_private_key_storage();
    let keys = storage.lock().unwrap();
    
    if let Some(key) = keys.get(&handle.id) {
        let view_key = ViewKey::<CurrentNetwork>::try_from(key).unwrap();
        let id = get_next_id();
        let vk_storage = ensure_view_key_storage();
        let mut view_keys = vk_storage.lock().unwrap();
        view_keys.insert(id, view_key);
        ffi::ViewKeyHandle { id }
    } else {
        ffi::ViewKeyHandle { id: 0 } // Invalid handle
    }
}

pub fn private_key_sign(handle: &ffi::PrivateKeyHandle, message: Vec<u8>) -> ffi::SignatureResult {
    let storage = ensure_private_key_storage();
    let keys = storage.lock().unwrap();
    
    if let Some(key) = keys.get(&handle.id) {
        match key.sign_bytes(&message, &mut rand::thread_rng()) {
            Ok(signature) => {
                let signature_bytes = signature.to_bytes_le().unwrap();
                signature_success_result(signature_bytes)
            }
            Err(e) => signature_error_result(format!("Signing failed: {}", e)),
        }
    } else {
        signature_error_result("Invalid private key handle".to_string())
    }
}

pub fn validate_private_key(private_key_str: String) -> bool {
    private_key_str.parse::<PrivateKey<CurrentNetwork>>().is_ok()
}

pub fn destroy_private_key(handle: &ffi::PrivateKeyHandle) {
    let storage = ensure_private_key_storage();
    let mut keys = storage.lock().unwrap();
    keys.remove(&handle.id);
}

// Address functions
pub fn address_from_string(address_str: String) -> ffi::AddressHandle {
    match address_str.parse::<Address<CurrentNetwork>>() {
        Ok(address) => {
            let id = get_next_id();
            let storage = ensure_address_storage();
            let mut addresses = storage.lock().unwrap();
            addresses.insert(id, address);
            ffi::AddressHandle { id }
        }
        Err(_) => ffi::AddressHandle { id: 0 }, // Invalid handle
    }
}

pub fn address_to_string(handle: &ffi::AddressHandle) -> ffi::AccountResult {
    let storage = ensure_address_storage();
    let addresses = storage.lock().unwrap();
    
    if let Some(address) = addresses.get(&handle.id) {
        success_result(address.to_string())
    } else {
        error_result("Invalid address handle".to_string())
    }
}

pub fn address_verify(handle: &ffi::AddressHandle, signature_bytes: Vec<u8>, message: Vec<u8>) -> bool {
    let storage = ensure_address_storage();
    let addresses = storage.lock().unwrap();
    
    if let Some(address) = addresses.get(&handle.id) {
        match Signature::<CurrentNetwork>::from_bytes_le(&signature_bytes) {
            Ok(signature) => signature.verify_bytes(address, &message),
            Err(_) => false,
        }
    } else {
        false
    }
}

pub fn validate_address(address_str: String) -> bool {
    address_str.parse::<Address<CurrentNetwork>>().is_ok()
}

pub fn destroy_address(handle: &ffi::AddressHandle) {
    let storage = ensure_address_storage();
    let mut addresses = storage.lock().unwrap();
    addresses.remove(&handle.id);
}

// ViewKey functions
pub fn view_key_from_string(view_key_str: String) -> ffi::ViewKeyHandle {
    match view_key_str.parse::<ViewKey<CurrentNetwork>>() {
        Ok(view_key) => {
            let id = get_next_id();
            let storage = ensure_view_key_storage();
            let mut view_keys = storage.lock().unwrap();
            view_keys.insert(id, view_key);
            ffi::ViewKeyHandle { id }
        }
        Err(_) => ffi::ViewKeyHandle { id: 0 }, // Invalid handle
    }
}

pub fn view_key_to_string(handle: &ffi::ViewKeyHandle) -> ffi::AccountResult {
    let storage = ensure_view_key_storage();
    let view_keys = storage.lock().unwrap();
    
    if let Some(view_key) = view_keys.get(&handle.id) {
        success_result(view_key.to_string())
    } else {
        error_result("Invalid view key handle".to_string())
    }
}

pub fn view_key_to_address(handle: &ffi::ViewKeyHandle) -> ffi::AddressHandle {
    let storage = ensure_view_key_storage();
    let view_keys = storage.lock().unwrap();
    
    if let Some(view_key) = view_keys.get(&handle.id) {
        match Address::<CurrentNetwork>::try_from(view_key) {
            Ok(address) => {
                let id = get_next_id();
                let addr_storage = ensure_address_storage();
                let mut addresses = addr_storage.lock().unwrap();
                addresses.insert(id, address);
                ffi::AddressHandle { id }
            }
            Err(_) => ffi::AddressHandle { id: 0 }, // Invalid handle
        }
    } else {
        ffi::AddressHandle { id: 0 } // Invalid handle
    }
}

pub fn validate_view_key(view_key_str: String) -> bool {
    view_key_str.parse::<ViewKey<CurrentNetwork>>().is_ok()
}

pub fn destroy_view_key(handle: &ffi::ViewKeyHandle) {
    let storage = ensure_view_key_storage();
    let mut view_keys = storage.lock().unwrap();
    view_keys.remove(&handle.id);
}

// Signature functions
pub fn destroy_signature(handle: &ffi::SignatureHandle) {
    let storage = ensure_signature_storage();
    let mut signatures = storage.lock().unwrap();
    signatures.remove(&handle.id);
}
