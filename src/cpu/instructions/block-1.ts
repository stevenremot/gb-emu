import { logger } from "../../utils/logger";
import { makeInstructionHandlerFromList } from "./handlers";
import { InstructionHandler } from "./types";

const Halt: InstructionHandler = {
  opcode: 0b01110110,
  mask: 0xff,
  name: "Halt",

  execute() {
    throw new Error("Halt not implemented");
  },
};

const LoadRR: InstructionHandler = {
  opcode: 0b01000000,
  mask: 0b11000000,
  name: "LoadRR'",

  execute({ opcode, registers }) {
    const destination = (opcode & 0b00111000) >> 3;
    const source = opcode & 0b00000111;
    registers.set8Bits(destination, registers.get8Bits(source));
    return { executionTime: 1 };
  },
};

const instructions: InstructionHandler[] = [Halt, LoadRR];

const log = logger("InstructionBlock1");

export const InstructionBlock1: InstructionHandler = {
  opcode: 0b01000000,
  mask: 0b11000000,

  execute: makeInstructionHandlerFromList(instructions, log),
};
