import { logger } from "../../utils/logger";
import { addUint8, subtractUint8 } from "../operations";
import { FlagNames, registerByCode, RegisterNames } from "../registers";
import { makeInstructionHandlerFromList } from "./handlers";
import { InstructionHandler } from "./types";

const AddR: InstructionHandler = {
  opcode: 0b10000000,
  mask: 0b11111000,
  name: "AddR",

  execute: ({ opcode, registers }) => {
    const register = opcode & 0b111;
    const { result, carry, halfCarry } = addUint8(
      registers.A,
      registers.get8Bits(register),
    );
    registers.A = result;

    registers.z = result === 0 ? 1 : 0;
    registers.c = carry;
    registers.h = halfCarry;
    registers.n = 0;

    return { executionTime: 1 };
  },
};

const SubR: InstructionHandler = {
  opcode: 0b10010000,
  mask: 0b11111000,

  execute: ({ opcode, registers }) => {
    const register = opcode & 0b111;
    const { result, carry, halfCarry } = subtractUint8(
      registers.A,
      registers.get8Bits(register),
    );
    registers.A = result;

    registers.z = result === 0 ? 1 : 0;
    registers.c = carry;
    registers.h = halfCarry;
    registers.n = 1;

    return {
      instruction: {
        opcode,
        name: `SUB ${registerByCode["8bits"][register as keyof (typeof registerByCode)["8bits"]]}`,
      },
      executionTime: 1,
    };
  },
};

const OrR: InstructionHandler = {
  opcode: 0b10110000,
  mask: 0b11111000,
  name: "OrR",

  execute: ({ opcode, registers }) => {
    const register = opcode & 0b111;
    const result =
      registers.get8Bits(RegisterNames.A) | registers.get8Bits(register);
    registers.set8Bits(RegisterNames.A, result);

    registers.setFlag(FlagNames.Z, result === 0 ? 1 : 0);
    registers.setFlag(FlagNames.C, 0);
    registers.setFlag(FlagNames.H, 0);
    registers.setFlag(FlagNames.N, 0);

    return { executionTime: 1 };
  },
};

const XorR: InstructionHandler = {
  opcode: 0b10101000,
  mask: 0b11111000,
  name: "XorR",

  execute: ({ opcode, registers }) => {
    const register = opcode & 0b111;
    const result =
      registers.get8Bits(RegisterNames.A) ^ registers.get8Bits(register);
    registers.set8Bits(RegisterNames.A, result);

    registers.setFlag(FlagNames.Z, result === 0 ? 1 : 0);
    registers.setFlag(FlagNames.C, 0);
    registers.setFlag(FlagNames.H, 0);
    registers.setFlag(FlagNames.N, 0);

    return { executionTime: 1 };
  },
};

const CmpHl: InstructionHandler = {
  opcode: 0b10111110,
  mask: 0xff,
  name: "CmpHl",

  execute: ({ registers, memoryMap }) => {
    const { result, carry, halfCarry } = subtractUint8(
      registers.A,
      memoryMap.readAt(registers.HL),
    );

    registers.z = result === 0 ? 1 : 0;
    registers.n = 1;
    registers.c = carry;
    registers.h = halfCarry;

    return { executionTime: 2 };
  },
};

const instructions: InstructionHandler[] = [AddR, SubR, OrR, XorR, CmpHl];

const log = logger("InstructionBlock2");

export const InstructionBlock2: InstructionHandler = {
  opcode: 0b10000000,
  mask: 0b11000000,

  execute: makeInstructionHandlerFromList(instructions, log),
};
