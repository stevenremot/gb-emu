import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";

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
});
