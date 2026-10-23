import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatMemoLabel, isValidMemo, memoExplorerUrl } from "../memo";

describe("memo helpers", () => {
  it("normalizes a valid settlement memo into the MP: code format", () => {
    assert.equal(formatMemoLabel("  MP: dinner-8f3a  "), "MP:dinner-8f3a");
    assert.equal(formatMemoLabel("dinner-8f3a"), "MP:dinner-8f3a");
  });

  it("rejects invalid memo values that are not in the MP:<code> format", () => {
    assert.equal(isValidMemo("dinner"), true);
    assert.equal(isValidMemo("MP:invalid memo"), false);
    assert.equal(isValidMemo("MP:too-long-012345678901234567890123456"), false);
  });

  it("builds the correct explorer link for the configured Stellar network", () => {
    const original = process.env.NEXT_PUBLIC_STELLAR_NETWORK;
    process.env.NEXT_PUBLIC_STELLAR_NETWORK = "testnet";
    try {
      assert.equal(
        memoExplorerUrl("abc123"),
        "https://stellar.expert/explorer/testnet/tx/abc123"
      );
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_STELLAR_NETWORK;
      else process.env.NEXT_PUBLIC_STELLAR_NETWORK = original;
    }
  });
});
