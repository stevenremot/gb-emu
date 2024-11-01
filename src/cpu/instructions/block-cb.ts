import { logger } from "../../utils/logger";
import { makeInstructionHandlerFromList } from "./handlers";
import { InstructionHandler } from "./types";

const BitBHl: InstructionHandler = {
  opcode: 0b01000110,
  mask: 0b11000111,
  name: "BitBHl",

  execute({ opcode, registers, memoryMap }) {
    const bit = (opcode & 0b00111000) >> 3;
    const value = memoryMap.readAt(registers.HL);
    const mask = 1 << bit;
    registers.Z = value & mask ? 0 : 1;
    return { executionTime: 3 };
  },
};

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

const instructions: InstructionHandler[] = [BitBHl, Set];

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
