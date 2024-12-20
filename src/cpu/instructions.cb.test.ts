import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";
import { RegisterNames } from "./registers";

describe("cpu/instructions - Block $CB", () => {
  it("Should test the bit BBB in the register RRR 0b01BBBRRR", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0xcb, 0b01011010]),
    );

    processor.registers.D = 0b00001111;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b01011010,
        name: "BitBR",
      },
      executionTime: 2,
    });
    expect(processor.registers.PC).toBe(0x102);
    expect(processor.registers.z).toBe(1);
    expect(processor.registers.n).toBe(0);
    expect(processor.registers.h).toBe(1);
  });

  it.each([
    { bit: 2, valueHL: 0b00001010, expectedZ: 0 },
    { bit: 2, valueHL: 0b00001110, expectedZ: 1 },
    { bit: 0, valueHL: 0b00001110, expectedZ: 0 },
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
      expect(processor.registers.z).toBe(expectedZ);
      expect(processor.registers.n).toBe(0);
      expect(processor.registers.h).toBe(1);
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

  it("Should reset the bit BBB in the byte pointed by [HL] on 0b10BBB110", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0xcb, 0b10010110]),
    );

    processor.registers.HL = 0xfff1;
    memoryMap.writeAt(processor.registers.HL, 0b00001111);

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b10010110,
        name: "ResBHl",
      },
      executionTime: 4,
    });
    expect(processor.registers.PC).toBe(0x102);
    expect(memoryMap.readAt(processor.registers.HL)).toBe(0b00001011);
  });

  it.each([
    {
      register: RegisterNames.B,
      value: 0b01000001,
      c: 0 as const,
      expectedValue: 0b10000010,
      expectedC: 0,
      expectedZ: 0,
    },
    {
      register: RegisterNames.C,
      value: 0b10000000,
      c: 0 as const,
      expectedValue: 0b00000000,
      expectedC: 1,
      expectedZ: 1,
    },
    {
      register: RegisterNames.C,
      value: 0b00000001,
      c: 1 as const,
      expectedValue: 0b00000011,
      expectedC: 0,
      expectedZ: 0,
    },
  ])(
    "Should rotate RRR left on 0b00010RRR ($register, $value)",
    ({ register, value, c, expectedValue, expectedC, expectedZ }) => {
      const opcode = 0b00010000 + register;
      const { processor } = makeInstructionTestInstance(
        new Uint8Array([0xcb, opcode]),
      );
      processor.registers.n = 1;
      processor.registers.h = 1;
      processor.registers.c = c;
      processor.registers.set8Bits(register, value);

      const result = processor.runOneInstruction();

      expect(result).toEqual({
        instruction: {
          opcode,
          name: "RlR",
        },
        executionTime: 2,
      });
      expect(processor.registers.PC).toBe(0x102);
      expect(processor.registers.n).toBe(0);
      expect(processor.registers.h).toBe(0);
      expect(processor.registers.get8Bits(register)).toBe(expectedValue);
      expect(processor.registers.z).toBe(expectedZ);
      expect(processor.registers.c).toBe(expectedC);
    },
  );
});
