import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";

describe("cpu/instructions - Block 0", () => {
  it("Should do nothing on 0b00000000", async () => {
    const { processor, runOneInstruction } = makeInstructionTestInstance(
      new Uint8Array([0x00, 0x00]),
    );
    const result = await runOneInstruction();

    expect(result).toEqual({
      executionTime: 1,
      instruction: { name: "Noop", opcode: 0 },
    });
    expect(processor.registers.PC).toEqual(0x101);
  });
});
