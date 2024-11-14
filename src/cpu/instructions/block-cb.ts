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
    registers.z = value & mask ? 1 : 0;
    registers.n = 0;
    registers.h = 1;

    return { executionTime: 3 };
  },
};

const BitBR: InstructionHandler = {
  opcode: 0b01000000,
  mask: 0b11000000,
  name: "BitBR",

  execute({ opcode, registers }) {
    const bit = (opcode & 0b00111000) >> 3;
    const mask = 1 << bit;
    const register = opcode & 0b00000111;
    const value = registers.get8Bits(register);
    registers.z = value & mask ? 1 : 0;
    registers.n = 0;
    registers.h = 1;

    return { executionTime: 2 };
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

const ResBHl: InstructionHandler = {
  opcode: 0b10000110,
  mask: 0b11000111,
  name: "ResBHl",

  execute: ({ opcode, registers, memoryMap }) => {
    const byte = (opcode & 0b00111000) >> 3;

    const currentValue = memoryMap.readAt(registers.HL);
    const mask = (1 << byte) ^ 0xff;
    memoryMap.writeAt(registers.HL, currentValue & mask);

    return { executionTime: 4 };
  },
};

const RlR: InstructionHandler = {
  opcode: 0b00010000,
  mask: 0b11111000,
  name: "RlR",

  execute: ({ opcode, registers }) => {
    const register = opcode & 0b00000111;
    const value = registers.get8Bits(register);

    const carry = ((value & 0b10000000) >> 7) as 0 | 1;
    const newValue = ((value << 1) | registers.c) & 0xff;

    registers.set8Bits(register, newValue);
    registers.z = newValue === 0 ? 1 : 0;
    registers.n = 0;
    registers.h = 0;
    registers.c = carry;

    return { executionTime: 2 };
  },
};

const instructions: InstructionHandler[] = [BitBHl, BitBR, Set, ResBHl, RlR];

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
