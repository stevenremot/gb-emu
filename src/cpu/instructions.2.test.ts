import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";

describe("cpu/instructions - Block 2", () => {
  it("Should perform a ADD between A and register RRR and store back the result to A on Ob10000RRR", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b10000010]),
    );
    processor.registers.A = 0xa1;
    processor.registers.D = 0x0f;
    processor.registers.n = 1;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b10000010,
        name: "AddR",
      },
      executionTime: 1,
    });
    expect(processor.registers.PC).toBe(0x101);
    expect(processor.registers.A).toBe(0xb0);
    expect(processor.registers.z).toBe(0);
    expect(processor.registers.c).toBe(0);
    expect(processor.registers.h).toBe(1);
    expect(processor.registers.n).toBe(0);
  });

  it("Should perform a SUB between A and register RRR and store back the result to A on Ob10010RRR", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b10010010]),
    );
    processor.registers.A = 0xa1;
    processor.registers.D = 0x0f;
    processor.registers.n = 0;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b10010010,
        name: "SUB D",
      },
      executionTime: 1,
    });
    expect(processor.registers.PC).toBe(0x101);
    expect(processor.registers.A).toBe(0x92);
    expect(processor.registers.z).toBe(0);
    expect(processor.registers.c).toBe(0);
    expect(processor.registers.h).toBe(1);
    expect(processor.registers.n).toBe(1);
  });

  it("Should compare A and value HL points to on 0b10111110", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0b10111110]),
    );
    processor.registers.A = 0xa0;
    processor.registers.HL = 0xfff0;
    memoryMap.writeAt(processor.registers.HL, 0xa0);

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b10111110,
        name: "CmpHl",
      },
      executionTime: 2,
    });
    expect(processor.registers.PC).toBe(0x101);
    expect(processor.registers.z).toBe(1);
    expect(processor.registers.n).toBe(1);
    expect(processor.registers.c).toBe(0);
    expect(processor.registers.h).toBe(0);
  });

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
      processor.registers.c = 1;
      processor.registers.h = 1;
      processor.registers.n = 1;

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
      expect(processor.registers.z).toBe(Z);
      expect(processor.registers.c).toBe(0);
      expect(processor.registers.h).toBe(0);
      expect(processor.registers.n).toBe(0);
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
      processor.registers.c = 1;
      processor.registers.h = 1;
      processor.registers.n = 1;

      const result = processor.runOneInstruction();
      expect(result).toEqual({
        instruction: { opcode: 0b10101010, name: "XorR" },
        executionTime: 1,
      });
      expect(processor.registers.A).toEqual(expected);
      expect(processor.registers.PC).toEqual(0x101);
      expect(processor.registers.z).toEqual(Z);
      expect(processor.registers.n).toEqual(0);
      expect(processor.registers.h).toEqual(0);
      expect(processor.registers.c).toEqual(0);
    },
  );
});
