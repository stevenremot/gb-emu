import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";
import { RegisterNames } from "./registers";

describe("cpu/instructions - Block $CB", () => {
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
