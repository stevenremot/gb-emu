import { describe, expect, it } from "vitest";
import { subtractUint8 } from "./operations";

describe("cpu/operations", () => {
  describe("subtractUint8", () => {
    it.each([
      { a: 0xf0, b: 0xf0, result: 0, carry: 0, halfCarry: 0 },
      { a: 0xff, b: 0xf0, result: 0xf, carry: 0, halfCarry: 0 },
      { a: 0xa0, b: 0xa5, result: 0xfb, carry: 1, halfCarry: 1 },
      { a: 0xa0, b: 0x81, result: 0x1f, carry: 0, halfCarry: 1 },
    ])(
      "Should compute result and carries correctly ($a, $b)",
      ({ a, b, result, carry, halfCarry }) => {
        expect(subtractUint8(a, b)).toEqual({
          result,
          carry,
          halfCarry,
        });
      },
    );
  });
});
