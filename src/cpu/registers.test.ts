import { describe, expect, it } from "vitest";
import { FlagNames, RegisterNames, Registers } from "./registers";

describe("cpu/Registers", () => {
  it("Should have PC and SP registers", () => {
    const registers = new Registers();

    expect(registers.PC).toBeTypeOf("number");
    expect(registers.SP).toBeTypeOf("number");
  });

  it("Should have 8-bits registers", () => {
    const registers = new Registers();

    const address = 6;
    const val = 0xfa;
    registers.set8Bits(address, val);

    expect(registers.get8Bits(address)).toBe(val);
  });

  it("Should have 16-bits registers", () => {
    const registers = new Registers();

    const address = 3;
    const val = 0xfacd;
    registers.set16Bits(address, val);

    expect(registers.get16Bits(address)).toBe(val);
  });

  it("Should share the space of 16-bots and 8-bits registers", () => {
    const registers = new Registers();

    registers.set16Bits(1, 0xfe03);

    expect(registers.get8Bits(2)).toBe(0xfe);
    expect(registers.get8Bits(3)).toBe(0x3);

    registers.set8Bits(3, 0xab);

    expect(registers.get16Bits(1)).toBe(0xfeab);
  });

  it("Should retrieve flags from AF lower bits", () => {
    const registers = new Registers();
    registers.set8Bits(RegisterNames.F, 0b11111010);
    expect(registers.getFlag(FlagNames.C)).toEqual(1);
    expect(registers.getFlag(FlagNames.H)).toEqual(0);
    expect(registers.getFlag(FlagNames.N)).toEqual(1);
    expect(registers.getFlag(FlagNames.Z)).toEqual(0);
  });

  it("It should save flags to AF lower bits", () => {
    const registers = new Registers();
    registers
      .setFlag(FlagNames.C, 0)
      .setFlag(FlagNames.H, 1)
      .setFlag(FlagNames.N, 1)
      .setFlag(FlagNames.Z, 0);
    expect(registers.get8Bits(RegisterNames.F)).toEqual(0b00000110);
  });
});
