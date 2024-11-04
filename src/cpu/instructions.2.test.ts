import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";

describe("cpu/instructions - Block 2", () => {
  it.each([
    { A: 0b0101001, D: 0b00000010, expectedResult: 0b0101011, Z: 0 },
    { A: 0, D: 0, expectedResult: 0, Z: 1 },
  ])(
    "Should perform a OR between A and registers RRR and store back the result to A on Ob01110RRR ($A, $D)",
    ({ A, D, expectedResult, Z }) => {
      const { processor } = makeInstructionTestInstance(
        new Uint8Array([0b10110010]),
      );
      processor.registers.A = A;
      processor.registers.D = D;
      processor.registers.C = 1;
      processor.registers.H = 1;
      processor.registers.N = 1;

      const result = processor.runOneInstruction();

      expect(result).toEqual({
        instruction: {
          opcode: 0b10110010,
          name: "OrR",
        },
        executionTime: 1,
      });
      expect(processor.registers.PC).toBe(0x101);
      expect(processor.registers.A).toBe(expectedResult);
      expect(processor.registers.Z).toBe(Z);
      expect(processor.registers.C).toBe(0);
      expect(processor.registers.H).toBe(0);
      expect(processor.registers.N).toBe(0);
    },
  );

  it.each([
    { A: 0b11110000, D: 0b00111100, expected: 0b11001100, Z: 0 },
    { A: 0b11110000, D: 0b11110000, expected: 0, Z: 1 },
  ])(
    "Should perform a XOR between A and register RRR and store back the result to A on Ob10101RRR ($A, $D)",
    ({ A, D, expected, Z }) => {
      const { processor } = makeInstructionTestInstance(
        new Uint8Array([0b10101010]),
      );
      processor.registers.A = A;
      processor.registers.D = D;
      processor.registers.C = 1;
      processor.registers.H = 1;
      processor.registers.N = 1;

      const result = processor.runOneInstruction();
      expect(result).toEqual({
        instruction: { opcode: 0b10101010, name: "XorR" },
        executionTime: 1,
      });
      expect(processor.registers.A).toEqual(expected);
      expect(processor.registers.PC).toEqual(0x101);
      expect(processor.registers.Z).toEqual(Z);
      expect(processor.registers.N).toEqual(0);
      expect(processor.registers.H).toEqual(0);
      expect(processor.registers.C).toEqual(0);
    },
  );
});
