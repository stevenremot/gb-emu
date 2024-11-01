import { logger } from "../../utils/logger";
import { FlagNames } from "../registers";
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

const LoadFromSP: InstructionHandler = {
  opcode: 0x08,
  mask: 0xff,
  name: "LoadFromSP",

  execute({ registers, memoryMap }) {
    const address = memoryMap.read16bitsAt(registers.PC);
    memoryMap.write16bitsAt(address, registers.SP);
    registers.PC += 2;

    return { executionTime: 5 };
  },
};

const LoadNToRRR: InstructionHandler = {
  opcode: 0b00000110,
  mask: 0b11000111,
  name: "LoadNToRRR",

  execute({ opcode, registers, memoryMap }) {
    const value = memoryMap.readAt(registers.PC);
    registers.PC += 1;

    const register = (opcode & 0b00111000) >> 3;
    registers.set8Bits(register, value);

    return { executionTime: 2 };
  },
};

const LoadNNToRR: InstructionHandler = {
  opcode: 0b00000001,
  mask: 0b11001111,
  name: "LoadNNToRR",

  execute({ opcode, registers, memoryMap }) {
    const value = memoryMap.read16bitsAt(registers.PC);
    const register = (opcode & 0b00110000) >> 4;

    if (register === 3) {
      registers.SP = value;
    } else {
      registers.set16Bits(register, value);
    }
    registers.PC += 2;

    return { executionTime: 3 };
  },
};

const JumpRelCond: InstructionHandler = {
  opcode: 0b00100000,
  mask: 0b11100111,
  name: "JumpRelCond",

  execute({ opcode, registers, memoryMap }) {
    const condition = (opcode & 0b00011000) >> 3;

    let isConditionMet = false;

    switch (condition) {
      case 0:
        isConditionMet = registers.getFlag(FlagNames.Z) === 0;
        break;
      case 1:
        isConditionMet = registers.getFlag(FlagNames.Z) === 1;
        break;
      case 2:
        isConditionMet = registers.getFlag(FlagNames.C) === 0;
        break;
      case 3:
        isConditionMet = registers.getFlag(FlagNames.C) === 1;
        break;
    }

    if (isConditionMet) {
      const offset = memoryMap.readAt(registers.PC);
      registers.PC += 1 + offset;
      return { executionTime: 3 };
    }

    registers.PC += 1;

    return { executionTime: 2 };
  },
};

const Ccf: InstructionHandler = {
  opcode: 0b00111111,
  mask: 0xff,
  name: "Ccf",

  execute({ registers }) {
    registers.C = registers.C ? 0 : 1;
    registers.N = 0;
    registers.H = 0;
    return { executionTime: 1 };
  },
};

const instructions: InstructionHandler[] = [
  Noop,
  LoadNToRRR,
  LoadNNToRR,
  LoadFromSP,
  JumpRelCond,
  Ccf,
];

const log = logger("InstructionBlock0");

export const InstructionBlock0: InstructionHandler = {
  opcode: 0x00,
  mask: 0b11000000,

  execute: makeInstructionHandlerFromList(instructions, log),
};
