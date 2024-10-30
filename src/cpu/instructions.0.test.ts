import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";

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

  it("Should load the provided value in the specified register on 0b00RR0001", () => {
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
});
