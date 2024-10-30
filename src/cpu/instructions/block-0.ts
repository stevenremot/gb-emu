import { logger } from "../../utils/logger";
import { makeInstructionHandlerFromList } from "./handlers";
import { InstructionHandler } from "./types";

const Noop = {
  opcode: 0x00,
  mask: 0xff,
  name: "Noop",

  execute() {
    return {
      executionTime: 1,
    };
  },
};

const instructions: InstructionHandler[] = [Noop];

const log = logger("InstructionBlock0");

export const InstructionBlock0: InstructionHandler = {
  opcode: 0x00,
  mask: 0b11000000,

  execute: makeInstructionHandlerFromList(instructions, log),
};
