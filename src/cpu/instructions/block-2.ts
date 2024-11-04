import { logger } from "../../utils/logger";
import { FlagNames, RegisterNames } from "../registers";
import { makeInstructionHandlerFromList } from "./handlers";
import { InstructionHandler } from "./types";

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

const instructions: InstructionHandler[] = [OrR, XorR];

const log = logger("InstructionBlock2");

export const InstructionBlock2: InstructionHandler = {
  opcode: 0b10000000,
  mask: 0b11000000,

  execute: makeInstructionHandlerFromList(instructions, log),
};
