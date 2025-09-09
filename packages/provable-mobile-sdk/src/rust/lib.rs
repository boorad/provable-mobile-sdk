use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::ptr;

// Re-export the types we need from snarkvm-console
use rand::{rngs::StdRng, SeedableRng};
use snarkvm_console::account::{
    Address as AddressNative, PrivateKey as PrivateKeyNative, Signature as SignatureNative,
    ViewKey as ViewKeyNative,
};
use snarkvm_console::prelude::{FromBytes, ToBytes};

// Use the default network type that should be available
type CurrentNetwork = snarkvm_console::network::Testnet3;

// Opaque handle types for C++ interop
pub struct PrivateKeyHandle {
    inner: PrivateKeyNative<CurrentNetwork>,
}

pub struct AddressHandle {
    inner: AddressNative<CurrentNetwork>,
}

pub struct ViewKeyHandle {
    inner: ViewKeyNative<CurrentNetwork>,
}

pub struct SignatureHandle {
    inner: SignatureNative<CurrentNetwork>,
}

// Helper function to convert Rust string to C string
fn rust_string_to_c_char(s: String) -> *mut c_char {
    match CString::new(s) {
        Ok(c_string) => c_string.into_raw(),
        Err(_) => ptr::null_mut(),
    }
}

// Helper function to convert C string to Rust string
fn c_char_to_rust_string(c_str: *const c_char) -> Result<String, &'static str> {
    if c_str.is_null() {
        return Err("Null pointer");
    }

    unsafe {
        match CStr::from_ptr(c_str).to_str() {
            Ok(s) => Ok(s.to_string()),
            Err(_) => Err("Invalid UTF-8"),
        }
    }
}

// Free C string allocated by Rust
#[no_mangle]
pub extern "C" fn free_c_string(s: *mut c_char) {
    if !s.is_null() {
        unsafe {
            let _ = CString::from_raw(s);
        }
    }
}

// PrivateKey FFI functions
#[no_mangle]
pub extern "C" fn private_key_new() -> *mut PrivateKeyHandle {
    let mut rng = StdRng::from_entropy();
    match PrivateKeyNative::new(&mut rng) {
        Ok(private_key) => Box::into_raw(Box::new(PrivateKeyHandle { inner: private_key })),
        Err(_) => ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn private_key_from_string(private_key_str: *const c_char) -> *mut PrivateKeyHandle {
    let private_key_string = match c_char_to_rust_string(private_key_str) {
        Ok(s) => s,
        Err(_) => return ptr::null_mut(),
    };

    match private_key_string.parse::<PrivateKeyNative<CurrentNetwork>>() {
        Ok(private_key) => Box::into_raw(Box::new(PrivateKeyHandle { inner: private_key })),
        Err(_) => ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn private_key_to_string(handle: *const PrivateKeyHandle) -> *mut c_char {
    if handle.is_null() {
        return ptr::null_mut();
    }

    unsafe {
        let private_key = &(*handle).inner;
        rust_string_to_c_char(private_key.to_string())
    }
}

#[no_mangle]
pub extern "C" fn private_key_to_address(handle: *const PrivateKeyHandle) -> *mut AddressHandle {
    if handle.is_null() {
        return ptr::null_mut();
    }

    unsafe {
        let private_key = &(*handle).inner;
        match AddressNative::try_from(private_key) {
            Ok(address) => Box::into_raw(Box::new(AddressHandle { inner: address })),
            Err(_) => ptr::null_mut(),
        }
    }
}

#[no_mangle]
pub extern "C" fn private_key_to_view_key(handle: *const PrivateKeyHandle) -> *mut ViewKeyHandle {
    if handle.is_null() {
        return ptr::null_mut();
    }

    unsafe {
        let private_key = &(*handle).inner;
        match ViewKeyNative::try_from(private_key) {
            Ok(view_key) => Box::into_raw(Box::new(ViewKeyHandle { inner: view_key })),
            Err(_) => ptr::null_mut(),
        }
    }
}

#[no_mangle]
pub extern "C" fn private_key_sign(
    handle: *const PrivateKeyHandle,
    message: *const u8,
    message_len: usize,
    signature_out: *mut *mut SignatureHandle,
) -> bool {
    if handle.is_null() || message.is_null() || signature_out.is_null() {
        return false;
    }

    unsafe {
        let private_key = &(*handle).inner;
        let message_slice = std::slice::from_raw_parts(message, message_len);

        match SignatureNative::sign_bytes(private_key, message_slice, &mut StdRng::from_entropy()) {
            Ok(signature) => {
                *signature_out = Box::into_raw(Box::new(SignatureHandle { inner: signature }));
                true
            }
            Err(_) => false,
        }
    }
}

#[no_mangle]
pub extern "C" fn private_key_free(handle: *mut PrivateKeyHandle) {
    if !handle.is_null() {
        unsafe {
            let _ = Box::from_raw(handle);
        }
    }
}

// Address FFI functions
#[no_mangle]
pub extern "C" fn address_from_string(address_str: *const c_char) -> *mut AddressHandle {
    let address_string = match c_char_to_rust_string(address_str) {
        Ok(s) => s,
        Err(_) => return ptr::null_mut(),
    };

    match address_string.parse::<AddressNative<CurrentNetwork>>() {
        Ok(address) => Box::into_raw(Box::new(AddressHandle { inner: address })),
        Err(_) => ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn address_to_string(handle: *const AddressHandle) -> *mut c_char {
    if handle.is_null() {
        return ptr::null_mut();
    }

    unsafe {
        let address = &(*handle).inner;
        rust_string_to_c_char(address.to_string())
    }
}

#[no_mangle]
pub extern "C" fn address_verify(
    handle: *const AddressHandle,
    signature_handle: *const SignatureHandle,
    message: *const u8,
    message_len: usize,
) -> bool {
    if handle.is_null() || signature_handle.is_null() || message.is_null() {
        return false;
    }

    unsafe {
        let address = &(*handle).inner;
        let signature = &(*signature_handle).inner;
        let message_slice = std::slice::from_raw_parts(message, message_len);

        signature.verify_bytes(address, message_slice)
    }
}

#[no_mangle]
pub extern "C" fn address_free(handle: *mut AddressHandle) {
    if !handle.is_null() {
        unsafe {
            let _ = Box::from_raw(handle);
        }
    }
}

// ViewKey FFI functions
#[no_mangle]
pub extern "C" fn view_key_from_string(view_key_str: *const c_char) -> *mut ViewKeyHandle {
    let view_key_string = match c_char_to_rust_string(view_key_str) {
        Ok(s) => s,
        Err(_) => return ptr::null_mut(),
    };

    match view_key_string.parse::<ViewKeyNative<CurrentNetwork>>() {
        Ok(view_key) => Box::into_raw(Box::new(ViewKeyHandle { inner: view_key })),
        Err(_) => ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn view_key_to_string(handle: *const ViewKeyHandle) -> *mut c_char {
    if handle.is_null() {
        return ptr::null_mut();
    }

    unsafe {
        let view_key = &(*handle).inner;
        rust_string_to_c_char(view_key.to_string())
    }
}

#[no_mangle]
pub extern "C" fn view_key_to_address(handle: *const ViewKeyHandle) -> *mut AddressHandle {
    if handle.is_null() {
        return ptr::null_mut();
    }

    unsafe {
        let view_key = &(*handle).inner;
        match AddressNative::try_from(view_key) {
            Ok(address) => Box::into_raw(Box::new(AddressHandle { inner: address })),
            Err(_) => ptr::null_mut(),
        }
    }
}

#[no_mangle]
pub extern "C" fn view_key_free(handle: *mut ViewKeyHandle) {
    if !handle.is_null() {
        unsafe {
            let _ = Box::from_raw(handle);
        }
    }
}

// Signature FFI functions
#[no_mangle]
pub extern "C" fn signature_to_bytes(
    handle: *const SignatureHandle,
    bytes_out: *mut *mut u8,
    len_out: *mut usize,
) -> bool {
    if handle.is_null() || bytes_out.is_null() || len_out.is_null() {
        return false;
    }

    unsafe {
        let signature = &(*handle).inner;
        let bytes = signature.to_bytes_le().unwrap_or_default();
        let len = bytes.len();

        let buffer = libc::malloc(len) as *mut u8;
        if buffer.is_null() {
            return false;
        }

        ptr::copy_nonoverlapping(bytes.as_ptr(), buffer, len);
        *bytes_out = buffer;
        *len_out = len;
        true
    }
}

#[no_mangle]
pub extern "C" fn signature_free(handle: *mut SignatureHandle) {
    if !handle.is_null() {
        unsafe {
            let _ = Box::from_raw(handle);
        }
    }
}

#[no_mangle]
pub extern "C" fn free_bytes(ptr: *mut u8) {
    if !ptr.is_null() {
        unsafe {
            libc::free(ptr as *mut libc::c_void);
        }
    }
}

// Additional signature FFI function needed by C++ code
#[no_mangle]
pub extern "C" fn signature_from_bytes(bytes: *const u8, len: usize) -> *mut SignatureHandle {
    if bytes.is_null() || len == 0 {
        return ptr::null_mut();
    }

    unsafe {
        let bytes_slice = std::slice::from_raw_parts(bytes, len);
        match SignatureNative::<CurrentNetwork>::from_bytes_le(bytes_slice) {
            Ok(signature) => Box::into_raw(Box::new(SignatureHandle { inner: signature })),
            Err(_) => ptr::null_mut(),
        }
    }
}
