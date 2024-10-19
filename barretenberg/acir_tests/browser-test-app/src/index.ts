import createDebug from "debug";
import { inflate } from "pako";
import { readFileSync } from "fs";
import { decode } from "@msgpack/msgpack";
import acirs from "./acir.msgpack";
import witnesses from "./witnesses.msgpack";

createDebug.enable("*");
const debug = createDebug("browser-test-app");

async function runTest(
  acirs: Uint8Array,
  witnesses: Uint8Array,
  // bytecodeMsgpack: Uint8Array[],
  // witnessMsgpack: Uint8Array[],
  threads?: number
) {
  const { AztecClientBackend } = await import("@aztec/bb.js");

  debug("starting test...");
  console.log(`input lengths after reading to Uint8Array's: ${acirs.length} and ${witnesses.length}`)
  const backend = new AztecClientBackend(acirs, { threads });
  const proof = await backend.generateProof(witnesses);
  console.log("generated proof");


  // debug(`getting the verification key...`);
  // const verificationKey = await backend.getVerificationKey();
  // debug(`destroying the backend...`);
  await backend.destroy();

  // debug(`verifying...`);
  // const verifier = new BarretenbergVerifier({ threads });
  // const verified = await verifier.verifyUltrahonkProof(proof, verificationKey);
  // debug(`verified: ${verified}`);

  // await verifier.destroy();

  // debug("test complete.");
  // return verified;
  return false;
}

(window as any).runTest = runTest;

function base64ToUint8Array(base64: string) {
  console.log(`input string length ${base64.length}`);
  let binaryString = atob(base64);
  let len = binaryString.length;
  console.log(`binary string length ${len}`);
  let bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// This is the verify_honk_proof test, for triggering via the button click.
// Will likely rot as acir changes.
// Update by extracting from ../acir_tests/verify_honk_proof. Specifically:
//   - The base64 representation of the ACIR is the bytecode section of program.json
//   - The base64 representation of the witness is obtained by encoding witness.gz
// const acir_unpacked = decode(acir) as Uint8Array[];
// const witness_unpacked= decode(witness) as Uint8Array[];

document.addEventListener("DOMContentLoaded", function () {
  const button = document.createElement("button");
  button.innerText = "Run Test";
  button.addEventListener("click", () => runTest(acirs as Uint8Array, witnesses as Uint8Array)); // before: unzipped witness; unzipped msgpack :white_check_mark:
  // button.addEventListener("click", () => runTest(acir_unpacked, witness_unpacked)); // before: unzipped witness; unzipped msgpack :white_check_mark:
  document.body.appendChild(button);
});
