import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";
import { RegisterNames } from "./registers";

describe("cpu/instructions - Block $CB", () => {
  it.each([
    { bit: 2, valueHL: 0b00001010, expectedZ: 1 },
    { bit: 2, valueHL: 0b00001110, expectedZ: 0 },
    { bit: 0, valueHL: 0b00001110, expectedZ: 1 },
  ])(
    "Should test the bit BBB in the byte pointed by [HL] on 0b01BBB110 ($bit, $valueHL)",
    ({ bit, valueHL, expectedZ }) => {
      const opcode = 0b01000110 + (bit << 3);
      const { processor, memoryMap } = makeInstructionTestInstance(
        new Uint8Array([0xcb, opcode]),
      );

      processor.registers.HL = 0xfff1;
      memoryMap.writeAt(processor.registers.HL, valueHL);

      const result = processor.runOneInstruction();

      expect(result).toEqual({
        instruction: {
          opcode,
          name: "BitBHl",
        },
        executionTime: 3,
      });
      expect(processor.registers.PC).toBe(0x102);
      expect(processor.registers.Z).toBe(expectedZ);
    },
  );

  it("Flip the bit BBB in register RRR to 1 in 0b11BBBRRR", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0xcb, 0b11010001]),
    );
    processor.registers.set8Bits(RegisterNames.C, 0b11000000);

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b11010001,
        name: "Set",
      },
      executionTime: 2,
    });
    expect(processor.registers.PC).toEqual(0x102);
    expect(processor.registers.get8Bits(RegisterNames.C)).toEqual(0b11000100);
  });
});
