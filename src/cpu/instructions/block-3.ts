import { logger } from "../../utils/logger";
import { makeInstructionHandlerFromList } from "./handlers";
import { syncInstructionEffect } from "./instruction-effect";
import { InstructionHandler } from "./types";

const Jump = {
  opcode: 0xc3,
  mask: 0xff,
  name: "Jump",

  execute() {
    return syncInstructionEffect(({ registers, memoryMap }) => {
      const bytes = memoryMap.readRange(registers.PC, 2);
      registers.PC = bytes[0] + (bytes[1] << 8);
      return { executionTime: 4 };
    });
  },
};

const instructions: InstructionHandler[] = [Jump];

const log = logger("InstructionBlock3");

export const InstructionBlock3: InstructionHandler = {
  opcode: 0b11000000,
  mask: 0b11000000,

  execute: makeInstructionHandlerFromList(instructions, log),
};
