use crate::{
    address::public_keys_hash::PublicKeysHash, constants::GENERATOR_INDEX__PUBLIC_KEYS_HASH,
    hash::poseidon2_hash_with_separator, point::POINT_LENGTH, traits::{Deserialize, Serialize, Hash}
};

use dep::std::embedded_curve_ops::EmbeddedCurvePoint as Point;
use dep::std::embedded_curve_ops::fixed_base_scalar_mul as derive_public_key;
use std::embedded_curve_ops::EmbeddedCurveScalar;
use std::default::Default;

pub global PUBLIC_KEYS_LENGTH: u32 = 12;

pub struct PublicKeys {
    npk_m: NpkM,
    ivpk_m: IvpkM,
    ovpk_m: OvpkM,
    tpk_m: TpkM,
}

pub trait ToPoint {
    fn to_point(self) -> Point;
}

pub struct NpkM {
    inner: Point
}

impl ToPoint for NpkM {
    fn to_point(self) -> Point {
        self.inner
    }
}

impl Serialize<POINT_LENGTH> for NpkM {
    fn serialize(self) -> [Field; POINT_LENGTH] {
        self.inner.serialize()
    }
}

// Note: If we store npk_m_hash directly we can remove this trait implementation. See #8091
impl Hash for NpkM {
    fn hash(self) -> Field {
        self.inner.hash()
    }
}

pub struct IvpkM {
    inner: Point
}

impl ToPoint for IvpkM {
    fn to_point(self) -> Point {
        self.inner
    }
}

impl Serialize<POINT_LENGTH> for IvpkM {
    fn serialize(self) -> [Field; POINT_LENGTH] {
        self.inner.serialize()
    }
}

pub struct OvpkM {
    inner: Point
}

impl Hash for OvpkM {
    fn hash(self) -> Field {
        self.inner.hash()
    }
}

impl ToPoint for OvpkM {
    fn to_point(self) -> Point {
        self.inner
    }
}

impl Serialize<POINT_LENGTH> for OvpkM {
    fn serialize(self) -> [Field; POINT_LENGTH] {
        self.inner.serialize()
    }
}

pub struct TpkM {
    inner: Point
}

impl ToPoint for TpkM {
    fn to_point(self) -> Point {
        self.inner
    }
}

impl Serialize<POINT_LENGTH> for TpkM {
    fn serialize(self) -> [Field; POINT_LENGTH] {
        self.inner.serialize()
    }
}

impl Default for PublicKeys {
    // This information is duplicated in circuits.js/src/types/public_keys.ts
    // We use this because empty will produce a point not on the curve.
    // This is:
    // "az_null_npk"
    // "az_null_ivpk"
    // "az_null_ovpk"
    // "az_null_tpk"
    // as bytes, hashed to curve using grumpkin::g1::affine_element::hash_to_curve(<X>, 0);
    fn default() -> Self {
        PublicKeys {
            npk_m: NpkM {
                inner: Point {
                    x: 0x01498945581e0eb9f8427ad6021184c700ef091d570892c437d12c7d90364bbd,
                    y: 0x170ae506787c5c43d6ca9255d571c10fa9ffa9d141666e290c347c5c9ab7e344,
                    is_infinite: false
                }
            },
            ivpk_m: IvpkM {
                inner: Point {
                    x: 0x00c044b05b6ca83b9c2dbae79cc1135155956a64e136819136e9947fe5e5866c,
                    y: 0x1c1f0ca244c7cd46b682552bff8ae77dea40b966a71de076ec3b7678f2bdb151,
                    is_infinite: false
                }
            },
            ovpk_m: OvpkM {
                inner: Point {
                    x: 0x1b00316144359e9a3ec8e49c1cdb7eeb0cedd190dfd9dc90eea5115aa779e287,
                    y: 0x080ffc74d7a8b0bccb88ac11f45874172f3847eb8b92654aaa58a3d2b8dc7833,
                    is_infinite: false
                }
            },
            tpk_m: TpkM {
                inner: Point {
                    x: 0x019c111f36ad3fc1d9b7a7a14344314d2864b94f030594cd67f753ef774a1efb,
                    y: 0x2039907fe37f08d10739255141bb066c506a12f7d1e8dfec21abc58494705b6f,
                    is_infinite: false
                }
            }
        }
    }
}

impl Eq for PublicKeys {
    fn eq(self, other: PublicKeys) -> bool {
        (self.npk_m.inner == other.npk_m.inner)
            & (self.ivpk_m.inner == other.ivpk_m.inner)
            & (self.ovpk_m.inner == other.ovpk_m.inner)
            & (self.tpk_m.inner == other.tpk_m.inner)
    }
}

impl PublicKeys {
    pub fn is_empty(self) -> bool {
        PublicKeys {
            npk_m: NpkM { inner: Point::empty() },
            ivpk_m: IvpkM { inner: Point::empty() },
            ovpk_m: OvpkM { inner: Point::empty() },
            tpk_m: TpkM { inner: Point::empty() }
        }.eq(self)
    }

    pub fn hash(self) -> PublicKeysHash {
        PublicKeysHash::from_field(
            if self.is_empty() {
            0
        } else {
            poseidon2_hash_with_separator(self.serialize(), GENERATOR_INDEX__PUBLIC_KEYS_HASH as Field)
        }
        )
    }
}

impl Serialize<PUBLIC_KEYS_LENGTH> for PublicKeys {
    fn serialize(self) -> [Field; PUBLIC_KEYS_LENGTH] {
        [
            self.npk_m.inner.x,
            self.npk_m.inner.y,
            self.npk_m.inner.is_infinite as Field,
            self.ivpk_m.inner.x,
            self.ivpk_m.inner.y,
            self.ivpk_m.inner.is_infinite as Field,
            self.ovpk_m.inner.x,
            self.ovpk_m.inner.y,
            self.ovpk_m.inner.is_infinite as Field,
            self.tpk_m.inner.x,
            self.tpk_m.inner.y,
            self.tpk_m.inner.is_infinite as Field
        ]
    }
}

impl Deserialize<PUBLIC_KEYS_LENGTH> for PublicKeys {
    fn deserialize(serialized: [Field; PUBLIC_KEYS_LENGTH]) -> PublicKeys {
        PublicKeys {
            npk_m: NpkM { inner: Point { x: serialized[0], y: serialized[1], is_infinite: serialized[2] as bool } },
            ivpk_m: IvpkM { inner: Point { x: serialized[3], y: serialized[4], is_infinite: serialized[5] as bool } },
            ovpk_m: OvpkM { inner: Point { x: serialized[6], y: serialized[7], is_infinite: serialized[8] as bool } },
            tpk_m: TpkM { inner: Point { x: serialized[9], y: serialized[10], is_infinite: serialized[11] as bool } }
        }
    }
}

#[test]
unconstrained fn compute_public_keys_hash() {
    let keys = PublicKeys {
        npk_m: NpkM { inner: Point { x: 1, y: 2, is_infinite: false } },
        ivpk_m: IvpkM { inner: Point { x: 3, y: 4, is_infinite: false } },
        ovpk_m: OvpkM { inner: Point { x: 5, y: 6, is_infinite: false } },
        tpk_m: TpkM { inner: Point { x: 7, y: 8, is_infinite: false } }
    };

    let actual = keys.hash();
    let expected_public_keys_hash = 0x0fecd9a32db731fec1fded1b9ff957a1625c069245a3613a2538bd527068b0ad;

    assert(actual.to_field() == expected_public_keys_hash);
}

#[test]
unconstrained fn compute_default_hash() {
    let keys = PublicKeys::default();

    let actual = keys.hash();
    let test_data_default_hash = 0x2ed36bfe5497fb6aa79ff85ed6657da92c17d50ac1ab5960e79a78c33687156f;

    assert(actual.to_field() == test_data_default_hash);
}

#[test]
unconstrained fn test_public_keys_serialization() {
    let keys = PublicKeys {
        npk_m: NpkM { inner: Point { x: 1, y: 2, is_infinite: false } },
        ivpk_m: IvpkM { inner: Point { x: 3, y: 4, is_infinite: false } },
        ovpk_m: OvpkM { inner: Point { x: 5, y: 6, is_infinite: false } },
        tpk_m: TpkM { inner: Point { x: 7, y: 8, is_infinite: false } }
    };

    let serialized = keys.serialize();
    let deserialized = PublicKeys::deserialize(serialized);

    assert_eq(keys.npk_m.inner.x, deserialized.npk_m.inner.x);
    assert_eq(keys.npk_m.inner.y, deserialized.npk_m.inner.y);
    assert_eq(keys.ivpk_m.inner.x, deserialized.ivpk_m.inner.x);
    assert_eq(keys.ivpk_m.inner.y, deserialized.ivpk_m.inner.y);
    assert_eq(keys.ovpk_m.inner.x, deserialized.ovpk_m.inner.x);
    assert_eq(keys.ovpk_m.inner.y, deserialized.ovpk_m.inner.y);
    assert_eq(keys.tpk_m.inner.x, deserialized.tpk_m.inner.x);
    assert_eq(keys.tpk_m.inner.y, deserialized.tpk_m.inner.y);
}
