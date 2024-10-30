import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";
import { RegisterNames } from "./registers";

describe("cpu/instructions - Block 3", () => {
  it("Should update PC with immediate value on 0xc3", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0xc3, 0xfc, 0x01]),
    );
    const result = processor.runOneInstruction();

    expect(result).toEqual({
      executionTime: 4,
      instruction: { name: "Jump", opcode: 0xc3 },
    });
    expect(processor.registers.PC).toEqual(0x01fc);
  });

  it("Should push the value of register into the stack on 0b11RR0101", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0b11100101]),
    );
    processor.registers.set16Bits(RegisterNames.HL, 0xfeda);
    processor.registers.SP = 0x1000;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      executionTime: 4,
      instruction: { name: "PushRR", opcode: 0b11100101 },
    });
    expect(processor.registers.SP).toEqual(0x0ffe);
    expect(memoryMap.read16bitsAt(0x0ffe)).toEqual(0xfeda);
  });

  it("Should load to A value at the address NN on 0b11111010", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0b11111010, 0x11, 0x2a]),
    );
    memoryMap.writeAt(0x2a11, 0xef);

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      executionTime: 4,
      instruction: {
        opcode: 0xfa,
        name: "LoadAcc",
      },
    });
    expect(processor.registers.get8Bits(RegisterNames.A)).toEqual(0xef);
    expect(processor.registers.PC).toEqual(0x103);
  });
});
