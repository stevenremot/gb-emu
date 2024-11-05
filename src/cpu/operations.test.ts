import { describe, expect, it } from "vitest";
import { addUint8, getSigned8, subtractUint8 } from "./operations";

describe("cpu/operations", () => {
  describe("getSigned8", () => {
    it.each([
      { value: 0b10000001, expected: -1 },
      { value: 0b00000010, expected: 2 },
    ])(
      "Should set the number sign to negative when the msb is 1 ($value)",
      ({ value, expected }) => {
        expect(getSigned8(value)).toBe(expected);
      },
    );
  });

  describe("addUint8", () => {
    it.each([
      { a: 0xf0, b: 0x10, result: 0, carry: 1, halfCarry: 0 },
      { a: 0x11, b: 0x01, result: 0x12, carry: 0, halfCarry: 0 },
      { a: 0xaf, b: 0x02, result: 0xb1, carry: 0, halfCarry: 1 },
    ])(
      "Should compute result and carries correctly ($a, $b)",
      ({ a, b, result, carry, halfCarry }) => {
        expect(addUint8(a, b)).toEqual({
          result,
          carry,
          halfCarry,
        });
      },
    );
  });

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
