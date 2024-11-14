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

  it("Should jump to the relative signed position on 0b00011000", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([
        // Positive
        0b00011000, 0b00000010, 0x00, 0x00,
        // Negative
        0b00011000, 0b11111110,
      ]),
    );

    let result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b00011000,
        name: "JumpRel",
      },
      executionTime: 3,
    });
    expect(processor.registers.PC).toEqual(0x104);

    result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b00011000,
        name: "JumpRel",
      },
      executionTime: 3,
    });
    expect(processor.registers.PC).toEqual(0x104);
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

  it("Should complement the carry flag on 0b00111111", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b00111111]),
    );

    processor.registers.c = 0;
    processor.registers.n = 1;
    processor.registers.h = 1;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b00111111,
        name: "Ccf",
      },
      executionTime: 1,
    });
    expect(processor.registers.c).toBe(1);
    expect(processor.registers.n).toBe(0);
    expect(processor.registers.h).toBe(0);
  });

  it("Should load to A the value pointed by HL and increment HL on 0b00101010", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0b00101010]),
    );

    processor.registers.HL = 0xffef;
    memoryMap.writeAt(processor.registers.HL, 0xad);

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b00101010,
        name: "LoadAHli",
      },
      executionTime: 2,
    });
    expect(processor.registers.PC).toBe(0x101);
    expect(processor.registers.A).toBe(0xad);
    expect(processor.registers.HL).toBe(0xfff0);
  });

  it("Should load to A the value pointed by HL and decrement HL on 0x00111010", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0b00111010]),
    );

    processor.registers.HL = 0xffef;
    memoryMap.writeAt(processor.registers.HL, 0xad);

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b00111010,
        name: "LoadAHld",
      },
      executionTime: 2,
    });
    expect(processor.registers.PC).toBe(0x101);
    expect(processor.registers.A).toBe(0xad);
    expect(processor.registers.HL).toBe(0xffee);
  });

  it("Should load to A the value pointed by RR on 0x00RR1010", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0b00001010]),
    );

    processor.registers.BC = 0xffef;
    memoryMap.writeAt(processor.registers.BC, 0xad);

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b00001010,
        name: "LoadAR",
      },
      executionTime: 2,
    });
    expect(processor.registers.PC).toBe(0x101);
    expect(processor.registers.A).toBe(0xad);
    expect(processor.registers.BC).toBe(0xffef);
  });

  it("Should save A to HL and decrement HL on 0b00110010", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0b00110010]),
    );

    processor.registers.A = 7;
    processor.registers.HL = 0xffe0;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b00110010,
        name: "LoadHldA",
      },
      executionTime: 2,
    });
    expect(processor.registers.PC).toBe(0x101);
    expect(processor.registers.HL).toBe(0xffdf);
    expect(memoryMap.readAt(0xffe0)).toBe(7);
  });

  it("Should save A to HL and increment HL on 0b00100010", () => {
    const { processor, memoryMap } = makeInstructionTestInstance(
      new Uint8Array([0b00100010]),
    );

    processor.registers.A = 7;
    processor.registers.HL = 0xffe0;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b00100010,
        name: "LoadHliA",
      },
      executionTime: 2,
    });
    expect(processor.registers.PC).toBe(0x101);
    expect(processor.registers.HL).toBe(0xffe1);
    expect(memoryMap.readAt(0xffe0)).toBe(7);
  });

  it("Should increment RR on 0b00RR0011", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b00000011]),
    );

    processor.registers.BC = 0x0a0a;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: { opcode: 0b00000011, name: "IncRr" },
      executionTime: 2,
    });

    expect(processor.registers.BC).toEqual(0x0a0b);
  });

  it("Should decrement RR on 0b00RR1011", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b00011011]),
    );
    processor.registers.DE = 2;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b00011011,
        name: "DecRr",
      },
      executionTime: 2,
    });
    expect(processor.registers.PC).toBe(0x101);
    expect(processor.registers.DE).toBe(1);
  });

  it.each([
    { value: 0xa0, expectedResult: 0xa1, z: 0, h: 0 },
    { value: 0xff, expectedResult: 0, z: 1, h: 1 },
    { value: 0xaf, expectedResult: 0xb0, z: 0, h: 1 },
  ])(
    "Should increment value at address HL on 0b00110100 ($value)",
    ({ value, expectedResult, z, h }) => {
      const { processor, memoryMap } = makeInstructionTestInstance(
        new Uint8Array([0b00110100]),
      );
      processor.registers.HL = 0xffe1;
      memoryMap.writeAt(0xffe1, value);

      const result = processor.runOneInstruction();

      expect(result).toEqual({
        instruction: {
          opcode: 0b00110100,
          name: "IncHl",
        },
        executionTime: 3,
      });
      expect(processor.registers.PC).toBe(0x101);
      expect(memoryMap.readAt(0xffe1)).toBe(expectedResult);
      expect(processor.registers.z).toBe(z);
      expect(processor.registers.n).toBe(0);
      expect(processor.registers.h).toBe(h);
    },
  );

  it.each([
    {
      register: RegisterNames.B,
      value: 0xef,
      expectedValue: 0xee,
      expectedZ: 0,
      expectedH: 0,
    },
    {
      register: RegisterNames.D,
      value: 0x01,
      expectedValue: 0,
      expectedZ: 1,
      expectedH: 0,
    },
    {
      register: RegisterNames.D,
      value: 0xe0,
      expectedValue: 0xdf,
      expectedZ: 0,
      expectedH: 1,
    },
  ])(
    "Should decrement register RRR on 0b00RRR101 ($register, $value)",
    ({ register, value, expectedValue, expectedZ, expectedH }) => {
      const opcode = 0b00000101 + (register << 3);
      const { processor } = makeInstructionTestInstance(
        new Uint8Array([opcode]),
      );

      processor.registers.n = 0;
      processor.registers.set8Bits(register, value);

      const result = processor.runOneInstruction();

      expect(result).toEqual({
        instruction: {
          opcode,
          name: "DecR",
        },
        executionTime: 1,
      });
      expect(processor.registers.PC).toBe(0x101);
      expect(processor.registers.get8Bits(register)).toBe(expectedValue);
      expect(processor.registers.n).toBe(1);
      expect(processor.registers.z).toBe(expectedZ);
      expect(processor.registers.h).toBe(expectedH);
    },
  );

  it.each([
    {
      value: 0xef,
      expectedValue: 0xee,
      expectedZ: 0,
      expectedH: 0,
    },
    {
      value: 0x01,
      expectedValue: 0,
      expectedZ: 1,
      expectedH: 0,
    },
    {
      value: 0xe0,
      expectedValue: 0xdf,
      expectedZ: 0,
      expectedH: 1,
    },
  ])(
    "Should decrement value pointed by HL on Ob00110101 ($value)",
    ({ value, expectedValue, expectedZ, expectedH }) => {
      const { processor, memoryMap } = makeInstructionTestInstance(
        new Uint8Array([0b00110101]),
      );

      processor.registers.n = 0;
      processor.registers.HL = 0xffe0;
      memoryMap.writeAt(processor.registers.HL, value);

      const result = processor.runOneInstruction();

      expect(result).toEqual({
        instruction: {
          opcode: 0b00110101,
          name: "DecHl",
        },
        executionTime: 3,
      });
      expect(processor.registers.PC).toBe(0x101);
      expect(memoryMap.readAt(processor.registers.HL)).toBe(expectedValue);
      expect(processor.registers.n).toBe(1);
      expect(processor.registers.z).toBe(expectedZ);
      expect(processor.registers.h).toBe(expectedH);
    },
  );

  it("Should increment register RRR on 0b00RRR100", () => {
    const { processor } = makeInstructionTestInstance(
      new Uint8Array([0b00010100]),
    );
    processor.registers.D = 0xef;

    const result = processor.runOneInstruction();

    expect(result).toEqual({
      instruction: {
        opcode: 0b00010100,
        name: "IncR",
      },
      executionTime: 1,
    });
    expect(processor.registers.PC).toBe(0x101);
    expect(processor.registers.D).toBe(0xf0);
    expect(processor.registers.z).toBe(0);
    expect(processor.registers.n).toBe(0);
    expect(processor.registers.h).toBe(1);
  });
});
