import { Fr, Point } from '@aztec/foundation/fields';
import { updateInlineTestData } from '@aztec/foundation/testing';

import { PublicKeys } from './public_keys.js';

describe('PublicKeys', () => {
  it('computes public keys hash', () => {
    const keys = new PublicKeys(
      new Point(new Fr(1n), new Fr(2n), false),
      new Point(new Fr(3n), new Fr(4n), false),
      new Point(new Fr(5n), new Fr(6n), false),
      new Point(new Fr(7n), new Fr(8n), false),
    );

    const hash = keys.hash().toString();
    expect(hash).toMatchInlineSnapshot(`"0x0fecd9a32db731fec1fded1b9ff957a1625c069245a3613a2538bd527068b0ad"`);

    // Run with AZTEC_GENERATE_TEST_DATA=1 to update noir test data
    updateInlineTestData(
      'noir-projects/noir-protocol-circuits/crates/types/src/public_keys.nr',
      'expected_public_keys_hash',
      hash,
    );
  });

  it('computes default keys hash', () => {
    const keys = PublicKeys.default();

    const hash = keys.hash().toString();
    expect(hash).toMatchInlineSnapshot(`"0x2ed36bfe5497fb6aa79ff85ed6657da92c17d50ac1ab5960e79a78c33687156f"`);

    // Run with AZTEC_GENERATE_TEST_DATA=1 to update noir test data
    updateInlineTestData(
      'noir-projects/noir-protocol-circuits/crates/types/src/public_keys.nr',
      'test_data_default_hash',
      hash,
    );
  });
});
