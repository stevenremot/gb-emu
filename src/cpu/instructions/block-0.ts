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

const instructions: InstructionHandler[] = [Noop, LoadNNToRR, LoadFromSP];

const log = logger("InstructionBlock0");

export const InstructionBlock0: InstructionHandler = {
  opcode: 0x00,
  mask: 0b11000000,

  execute: makeInstructionHandlerFromList(instructions, log),
};
