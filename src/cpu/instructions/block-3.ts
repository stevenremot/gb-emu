import { logger } from "../../utils/logger";
import { RegisterNames } from "../registers";
import { makeInstructionHandlerFromList } from "./handlers";
import { InstructionHandler } from "./types";

const Jump: InstructionHandler = {
  opcode: 0xc3,
  mask: 0xff,
  name: "Jump",

  execute({ registers, memoryMap }) {
    const bytes = memoryMap.readRange(registers.PC, 2);
    registers.PC = bytes[0] + (bytes[1] << 8);
    return { executionTime: 4 };
  },
};

const PushRR: InstructionHandler = {
  opcode: 0b11000101,
  mask: 0b11001111,
  name: "PushRR",

  execute({ opcode, registers, memoryMap }) {
    const register = (opcode & 0b00110000) >> 4;
    const value = registers.get16Bits(register);
    memoryMap.write16bitsAt(registers.SP - 2, value);
    registers.SP -= 2;
    return { executionTime: 4 };
  },
};

const LoadAcc: InstructionHandler = {
  opcode: 0b11111010,
  mask: 0xff,
  name: "LoadAcc",

  execute({ registers, memoryMap }) {
    const address = memoryMap.read16bitsAt(registers.PC);
    const value = memoryMap.readAt(address);
    registers.set8Bits(RegisterNames.A, value);
    registers.PC += 2;
    return { executionTime: 4 };
  },
};

const instructions: InstructionHandler[] = [Jump, PushRR, LoadAcc];

const log = logger("InstructionBlock3");

export const InstructionBlock3: InstructionHandler = {
  opcode: 0b11000000,
  mask: 0b11000000,

  execute: makeInstructionHandlerFromList(instructions, log),
};
