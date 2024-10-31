import { describe, expect, it } from "vitest";
import { makeInstructionTestInstance } from "./test-utils";
import { FlagNames, RegisterNames } from "./registers";

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

  it("Should call the function at the address NN on 0b11001101", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0b11001101, 0xcd, 0xab]),
    );

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: { opcode: 0b11001101, name: "CallNN" },
      executionTime: 6,
    });
    expect(processor.registers.PC).toEqual(0xabcd);
    expect(processor.registers.SP).toEqual(0xfffd);
    expect(memoryMap.read16bitsAt(processor.registers.SP)).toEqual(0x103);
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

  it("Should pop the stack into the provided register RR on 0b11RR0001", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0b11010001]),
    );
    processor.registers.SP = 0xfff0;
    memoryMap.write16bitsAt(processor.registers.SP, 0xabcd);

    const result = processor.runOneInstruction();
    expect(result).toEqual({
      instruction: {
        opcode: 0b11010001,
        name: "PopRR",
      },
      executionTime: 3,
    });
    expect(processor.registers.PC).toEqual(0x101);
    expect(processor.registers.SP).toEqual(0xfff2);
    expect(processor.registers.get16Bits(RegisterNames.DE)).toEqual(0xabcd);
  });

  it("Should store A value to the address 0xff00 + n on 0b11100000", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0b11100000, 0xe0]),
    );

    processor.registers.set8Bits(RegisterNames.A, 0x32);

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: { opcode: 0b11100000, name: "SaveAcc" },
      executionTime: 3,
    });
    expect(processor.registers.PC).toEqual(0x102);
    expect(memoryMap.readAt(0xffe0)).toBe(0x32);
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

  it.each([
    // arg = A
    { A: 0xa0, arg: 0xa0, expected: { Z: 1, N: 1, H: 0, C: 0 } },
    // arg > A
    { A: 0xa0, arg: 0xa1, expected: { Z: 0, N: 1, H: 1, C: 1 } },
    // arg < A
    { A: 0xa0, arg: 0x61, expected: { Z: 0, N: 1, H: 1, C: 0 } },
    // arg > 1 w/o half carry
    { A: 0xa0, arg: 0xb0, expected: { Z: 0, N: 1, H: 0, C: 1 } },
  ])(
    "Should compare A with the given value on 0b11111110 ($A, $arg)",
    ({ A, arg, expected }) => {
      const { processor } = makeInstructionTestInstance(
        new Uint8Array([0b11111110, arg]),
      );
      processor.registers.set8Bits(RegisterNames.A, A);
      let result = processor.runOneInstruction();

      expect(result).toEqual({
        instruction: {
          opcode: 0b11111110,
          name: "CmpN",
        },
        executionTime: 2,
      });
      expect(processor.registers.getFlag(FlagNames.Z)).toEqual(expected.Z);
      expect(processor.registers.getFlag(FlagNames.N)).toEqual(expected.N);
      expect(processor.registers.getFlag(FlagNames.H)).toEqual(expected.H);
      expect(processor.registers.getFlag(FlagNames.C)).toEqual(expected.C);
      expect(processor.registers.PC).toEqual(0x102);
    },
  );

  it("Should disable IME register on Ob11110011", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b11110011]),
    );
    processor.registers.IME = true;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b11110011,
        name: "Di",
      },
      executionTime: 1,
    });
    expect(processor.registers.IME).toBe(false);
    expect(processor.registers.PC).toEqual(0x101);
  });
});
