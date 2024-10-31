import { logger } from "../../utils/logger";
import { makeInstructionHandlerFromList } from "./handlers";
import { InstructionHandler } from "./types";

const Set: InstructionHandler = {
  opcode: 0b11000000,
  mask: 0b11000000,
  name: "Set",

  execute({ opcode, registers }) {
    const bit = (opcode & 0b00111000) >> 3;
    const register = opcode & 0b00000111;

    const bitMask = 1 << bit;

    registers.set8Bits(register, registers.get8Bits(register) | bitMask);

    return { executionTime: 2 };
  },
};

const instructions: InstructionHandler[] = [Set];

const log = logger("InstructionBlockCB");

const subHandler = makeInstructionHandlerFromList(instructions, log);

export const InstructionBlockCB: InstructionHandler = {
  opcode: 0xcb,
  mask: 0xff,

  execute(args) {
    const { registers, memoryMap } = args;
    const opcode = memoryMap.readAt(registers.PC);
    registers.PC += 1;
    return subHandler({ ...args, opcode });
  },
};
