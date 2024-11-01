import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";
import { FlagNames, RegisterNames } from "./registers";

describe("cpu/instructions - Block 0", () => {
  it("Should do nothing on 0b00000000", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0x00, 0x00]),
    );
    const result = processor.runOneInstruction();

    expect(result).toEqual({
      executionTime: 1,
      instruction: { name: "Noop", opcode: 0 },
    });
    expect(processor.registers.PC).toEqual(0x101);
  });

  it("Should load the SP value at the specified address on 0x00001000", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0x08, 0xad, 0x10]),
    );
    processor.registers.SP = 0xfe65;

    const result = processor.runOneInstruction();
    expect(result).toEqual({
      executionTime: 5,
      instruction: { opcode: 0x08, name: "LoadFromSP" },
    });

    expect(memoryMap.readAt(0x10ad)).toEqual(processor.registers.SP & 0xff);
    expect(memoryMap.readAt(0x10ae)).toEqual(processor.registers.SP >> 8);
    expect(processor.registers.PC).toEqual(0x103);
  });

  it("Should load the provided value in the specified RRR register on 0b00RRR110", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b00100110, 0xad]),
    );

    const result = processor.runOneInstruction();
    expect(result).toEqual({
      executionTime: 2,
      instruction: { opcode: 0b00100110, name: "LoadNToRRR" },
    });
    expect(processor.registers.PC).toEqual(0x102);
    expect(processor.registers.get8Bits(RegisterNames.H)).toEqual(0xad);
  });

  it("Should load the provided value in the specified RR register on 0b00RR0001", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b00100001, 0xad, 0x10]),
    );

    const result = processor.runOneInstruction();
    expect(result).toEqual({
      executionTime: 3,
      instruction: { opcode: 0x21, name: "LoadNNToRR" },
    });

    expect(processor.registers.get16Bits(2)).toEqual(0x10ad);
    expect(processor.registers.PC).toEqual(0x103);
  });

  it.each([
    { CC: 0, Z: 0, C: 0 },
    { CC: 1, Z: 1, C: 0 },
    { CC: 2, Z: 0, C: 0 },
    { CC: 3, Z: 0, C: 1 },
  ] as const)(
    "Should jump to the provided address offset when the condition is met on 0b001CC000 ($CC)",
    ({ CC, Z, C }) => {
      const opcode = 0b00100000 | (CC << 3);
      const { processor } = makeInstructionTestInstance(
        new Uint8Array([opcode, 0x4]),
      );

      processor.registers.setFlag(FlagNames.Z, Z);
      processor.registers.setFlag(FlagNames.C, C);

      const result = processor.runOneInstruction();
      expect(result).toEqual({
        instruction: {
          opcode,
          name: "JumpRelCond",
        },
        executionTime: 3,
      });
      expect(processor.registers.PC).toEqual(0x106);
    },
  );

  it.each([
    { CC: 0, Z: 1, C: 0 },
    { CC: 1, Z: 0, C: 0 },
    { CC: 2, Z: 0, C: 1 },
    { CC: 3, Z: 0, C: 0 },
  ] as const)(
    "Should not jump to the provided address offset when the condition is not met on 0b001CC000 ($CC)",
    ({ CC, Z, C }) => {
      const opcode = 0b00100000 | (CC << 3);
      const { processor } = makeInstructionTestInstance(
        new Uint8Array([opcode, 0x4]),
      );

      processor.registers.setFlag(FlagNames.Z, Z);
      processor.registers.setFlag(FlagNames.C, C);

      const result = processor.runOneInstruction();
      expect(result).toEqual({
        instruction: {
          opcode,
          name: "JumpRelCond",
        },
        executionTime: 2,
      });
      expect(processor.registers.PC).toEqual(0x102);
    },
  );

  it("Should load the provided value in SP on 0b00110001", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b00110001, 0xad, 0x10]),
    );

    const result = processor.runOneInstruction();
    expect(result).toEqual({
      executionTime: 3,
      instruction: { opcode: 0x31, name: "LoadNNToRR" },
    });

    expect(processor.registers.SP).toEqual(0x10ad);
    expect(processor.registers.PC).toEqual(0x103);
  });

  it("Should complement the carry flag on 0b00111111", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b00111111]),
    );

    processor.registers.C = 0;
    processor.registers.N = 1;
    processor.registers.H = 1;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b00111111,
        name: "Ccf",
      },
      executionTime: 1,
    });
    expect(processor.registers.C).toBe(1);
    expect(processor.registers.N).toBe(0);
    expect(processor.registers.H).toBe(0);
  });
});
