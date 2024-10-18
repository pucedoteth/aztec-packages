import { poseidon2HashWithSeparator } from '@aztec/foundation/crypto';
import { Fq, Fr, Point } from '@aztec/foundation/fields';
import { BufferReader, FieldReader, serializeToBuffer } from '@aztec/foundation/serialize';

import { GeneratorIndex } from '../constants.gen.js';
import { derivePublicKeyFromSecretKey } from '../keys/derivation.js';
import { type PublicKey } from './public_key.js';

export class PublicKeys {
  public constructor(
    /** Contract address (typically of an account contract) */
    /** Master nullifier public key */
    public masterNullifierPublicKey: PublicKey,
    /** Master incoming viewing public key */
    public masterIncomingViewingPublicKey: PublicKey,
    /** Master outgoing viewing public key */
    public masterOutgoingViewingPublicKey: PublicKey,
    /** Master tagging viewing public key */
    public masterTaggingPublicKey: PublicKey,
  ) {}

  hash() {
    return this.isEmpty()
      ? Fr.ZERO
      : poseidon2HashWithSeparator(
          [
            this.masterNullifierPublicKey,
            this.masterIncomingViewingPublicKey,
            this.masterOutgoingViewingPublicKey,
            this.masterTaggingPublicKey,
          ],
          GeneratorIndex.PUBLIC_KEYS_HASH,
        );
  }

  isEmpty() {
    return (
      this.masterNullifierPublicKey.isZero() &&
      this.masterIncomingViewingPublicKey.isZero() &&
      this.masterOutgoingViewingPublicKey.isZero() &&
      this.masterTaggingPublicKey.isZero()
    );
  }

  static default(): PublicKeys {
    // This information is duplicated in noir-protocol-circuits/crates/types/src/public_keys.nr
    // We use this because empty will produce a point not on the curve.
    // This is:
    // "az_null_npk"
    // "az_null_ivpk"
    // "az_null_ovpk"
    // "az_null_tpk"
    // as bytes, hashed to curve using grumpkin::g1::affine_element::hash_to_curve(<X>, 0);
    return new PublicKeys(
      new Point(
        new Fr(0x01498945581e0eb9f8427ad6021184c700ef091d570892c437d12c7d90364bbdn),
        new Fr(0x170ae506787c5c43d6ca9255d571c10fa9ffa9d141666e290c347c5c9ab7e344n),
        false,
      ),
      new Point(
        new Fr(0x00c044b05b6ca83b9c2dbae79cc1135155956a64e136819136e9947fe5e5866cn),
        new Fr(0x1c1f0ca244c7cd46b682552bff8ae77dea40b966a71de076ec3b7678f2bdb151n),
        false,
      ),
      new Point(
        new Fr(0x1b00316144359e9a3ec8e49c1cdb7eeb0cedd190dfd9dc90eea5115aa779e287n),
        new Fr(0x080ffc74d7a8b0bccb88ac11f45874172f3847eb8b92654aaa58a3d2b8dc7833n),
        false,
      ),
      new Point(
        new Fr(0x019c111f36ad3fc1d9b7a7a14344314d2864b94f030594cd67f753ef774a1efbn),
        new Fr(0x2039907fe37f08d10739255141bb066c506a12f7d1e8dfec21abc58494705b6fn),
        false,
      ),
    );
  }

  static random(): PublicKeys {
    return new PublicKeys(Point.random(), Point.random(), Point.random(), Point.random());
  }

  /**
   * Determines if this PublicKeys instance is equal to the given PublicKeys instance.
   * Equality is based on the content of their respective buffers.
   *
   * @param other - The PublicKeys instance to compare against.
   * @returns True if the buffers of both instances are equal, false otherwise.
   */
  equals(other: PublicKeys): boolean {
    return (
      this.masterNullifierPublicKey.equals(other.masterNullifierPublicKey) &&
      this.masterIncomingViewingPublicKey.equals(other.masterIncomingViewingPublicKey) &&
      this.masterOutgoingViewingPublicKey.equals(other.masterOutgoingViewingPublicKey) &&
      this.masterTaggingPublicKey.equals(other.masterTaggingPublicKey)
    );
  }

  /**
   * Converts the PublicKeys instance into a Buffer.
   * This method should be used when encoding the address for storage, transmission or serialization purposes.
   *
   * @returns A Buffer representation of the PublicKeys instance.
   */
  toBuffer(): Buffer {
    return serializeToBuffer([
      this.masterNullifierPublicKey,
      this.masterIncomingViewingPublicKey,
      this.masterOutgoingViewingPublicKey,
      this.masterTaggingPublicKey,
    ]);
  }

  /**
   * Creates an PublicKeys instance from a given buffer or BufferReader.
   * If the input is a Buffer, it wraps it in a BufferReader before processing.
   * Throws an error if the input length is not equal to the expected size.
   *
   * @param buffer - The input buffer or BufferReader containing the address data.
   * @returns - A new PublicKeys instance with the extracted address data.
   */
  static fromBuffer(buffer: Buffer | BufferReader): PublicKeys {
    const reader = BufferReader.asReader(buffer);
    const masterNullifierPublicKey = reader.readObject(Point);
    const masterIncomingViewingPublicKey = reader.readObject(Point);
    const masterOutgoingViewingPublicKey = reader.readObject(Point);
    const masterTaggingPublicKey = reader.readObject(Point);
    return new PublicKeys(
      masterNullifierPublicKey,
      masterIncomingViewingPublicKey,
      masterOutgoingViewingPublicKey,
      masterTaggingPublicKey,
    );
  }

  toNoirStruct() {
    // We need to use lowercase identifiers as those are what the noir interface expects
    // eslint-disable-next-line camelcase
    return {
      // TODO(#6337): Directly dump account.publicKeys here
      /* eslint-disable camelcase */
      npk_m: this.masterNullifierPublicKey.toWrappedNoirStruct(),
      ivpk_m: this.masterIncomingViewingPublicKey.toWrappedNoirStruct(),
      ovpk_m: this.masterOutgoingViewingPublicKey.toWrappedNoirStruct(),
      tpk_m: this.masterTaggingPublicKey.toWrappedNoirStruct(),
      /* eslint-enable camelcase */
    };
  }

  /**
   * Serializes the payload to an array of fields
   * @returns The fields of the payload
   */
  toFields(): Fr[] {
    return [
      ...this.masterNullifierPublicKey.toFields(),
      ...this.masterIncomingViewingPublicKey.toFields(),
      ...this.masterOutgoingViewingPublicKey.toFields(),
      ...this.masterTaggingPublicKey.toFields(),
    ];
  }

  // TOOD: This is used in foundation/src/abi/encoder. This is probably non-optimal but I did not want
  // to spend too much time on the encoder now. It probably needs a refactor.
  encodeToNoir(): Fr[] {
    return this.toFields();
  }

  static fromFields(fields: Fr[] | FieldReader): PublicKeys {
    const reader = FieldReader.asReader(fields);
    return new PublicKeys(
      reader.readObject(Point),
      reader.readObject(Point),
      reader.readObject(Point),
      reader.readObject(Point),
    );
  }

  toString() {
    return this.toBuffer().toString('hex');
  }

  static fromString(keys: string) {
    return PublicKeys.fromBuffer(Buffer.from(keys, 'hex'));
  }
}
