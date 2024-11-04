import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";

describe("cpu/instructions - Block 1", () => {
  it("Should load register RRR into register R'R'R' on 0b01R'R'R'RRR", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b01010011]),
    );
    processor.registers.D = 3;
    processor.registers.E = 7;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b01010011,
        name: "LoadRR'",
      },
      executionTime: 1,
    });
    expect(processor.registers.PC).toBe(0x101);
    expect(processor.registers.D).toBe(7);
    expect(processor.registers.E).toBe(7);
  });
});
