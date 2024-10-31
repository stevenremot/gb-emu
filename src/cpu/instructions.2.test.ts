import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";
import { FlagNames, RegisterNames } from "./registers";

describe("cpu/instructions - Block 2", () => {
  it.each([
    { A: 0b11110000, D: 0b00111100, expected: 0b11001100, Z: 0 },
    { A: 0b11110000, D: 0b11110000, expected: 0, Z: 1 },
  ])(
    "Should perform a XOR between A and register RRR and store back the result to A on Ob10101RRR ($A, $D)",
    ({ A, D, expected, Z }) => {
      const { processor } = makeInstructionTestInstance(
        new Uint8Array([0b10101010]),
      );
      processor.registers.set8Bits(RegisterNames.A, A);
      processor.registers.set8Bits(RegisterNames.D, D);
      processor.registers.setFlag(FlagNames.C, 1);
      processor.registers.setFlag(FlagNames.H, 1);
      processor.registers.setFlag(FlagNames.N, 1);

      const result = processor.runOneInstruction();
      expect(result).toEqual({
        instruction: { opcode: 0b10101010, name: "XorR" },
        executionTime: 1,
      });
      expect(processor.registers.get8Bits(RegisterNames.A)).toEqual(expected);
      expect(processor.registers.PC).toEqual(0x101);
      expect(processor.registers.getFlag(FlagNames.Z)).toEqual(Z);
      expect(processor.registers.getFlag(FlagNames.N)).toEqual(0);
      expect(processor.registers.getFlag(FlagNames.H)).toEqual(0);
      expect(processor.registers.getFlag(FlagNames.C)).toEqual(0);
    },
  );
});
