
# We do not need to bloat barretenberg.wasm with gzip functionality in a browser context as the browser can do this

set(DSL_DEPENDENCIES
    client_ivc
    plonk
    ultra_honk
    stdlib_sha256
    stdlib_aes128
    stdlib_keccak
    stdlib_poseidon2
    crypto_merkle_tree
    stdlib_schnorr
    stdlib_honk_verifier)

if (NOT WASM)
    list(APPEND DSL_DEPENDENCIES libdeflate::libdeflate_static vm)
endif()

barretenberg_module(
    dsl
    ${DSL_DEPENDENCIES}
)

if(CMAKE_CXX_COMPILER_ID MATCHES "Clang")
    target_compile_options(dsl_objects PRIVATE -Wno-sign-conversion -Wno-float-conversion -Wno-implicit-int-float-conversion -Wno-implicit-int-conversion)
endif()