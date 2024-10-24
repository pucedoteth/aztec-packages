import { Note, TxHash, UnencryptedTxL2Logs } from '@aztec/circuit-types';
import { AztecAddress, Fr, Point, type PublicKey, Vector } from '@aztec/circuits.js';
import { NoteSelector } from '@aztec/foundation/abi';
import { BufferReader, serializeToBuffer } from '@aztec/foundation/serialize';

/**
 * A note that is intended for us, but we cannot decode it yet because the contract is not yet in our database.
 *
 * So keep the state that we need to decode it later.
 */
export class DeferredNoteDao {
  constructor(
    /** IvpkM or OvpkM (depending on if incoming or outgoing) the note was encrypted with. */
    public publicKey: PublicKey,
    /** The note as emitted from the Noir contract. */
    public note: Note,
    /** The contract address this note is created in. */
    public contractAddress: AztecAddress,
    /** The specific storage location of the note on the contract. */
    public storageSlot: Fr,
    /** The type ID of the note on the contract. */
    public noteTypeId: NoteSelector,
    /** The hash of the tx the note was created in. Equal to the first nullifier */
    public txHash: TxHash,
    /** New note hashes in this transaction, one of which belongs to this note */
    public noteHashes: Fr[],
    /** The next available leaf index for the note hash tree for this transaction */
    public dataStartIndexForTx: number,
    /** Unencrypted logs for the transaction (used to complete partial notes) */
    public unencryptedLogs: UnencryptedTxL2Logs,
  ) {}

  toBuffer(): Buffer {
    return serializeToBuffer(
      this.publicKey,
      this.note,
      this.contractAddress,
      this.storageSlot,
      this.noteTypeId,
      this.txHash,
      new Vector(this.noteHashes),
      this.dataStartIndexForTx,
      this.unencryptedLogs,
    );
  }
  static fromBuffer(buffer: Buffer | BufferReader) {
    const reader = BufferReader.asReader(buffer);
    return new DeferredNoteDao(
      reader.readObject(Point),
      reader.readObject(Note),
      reader.readObject(AztecAddress),
      reader.readObject(Fr),
      reader.readObject(NoteSelector),
      reader.readObject(TxHash),
      reader.readVector(Fr),
      reader.readNumber(),
      reader.readObject(UnencryptedTxL2Logs),
    );
  }
}
