import { logger } from "../../utils/logger";
import { FlagNames, RegisterNames } from "../registers";
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

const CallNN: InstructionHandler = {
  opcode: 0b11001101,
  mask: 0xff,
  name: "CallNN",

  execute({ registers, memoryMap }) {
    const value = memoryMap.read16bitsAt(registers.PC);
    registers.PC += 2;

    registers.SP -= 1;
    memoryMap.write16bitsAt(registers.SP, registers.PC);

    registers.PC = value;
    return { executionTime: 6 };
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

const PopRR: InstructionHandler = {
  opcode: 0b11000001,
  mask: 0b11001111,
  name: "PopRR",

  execute({ opcode, registers, memoryMap }) {
    const register = (opcode & 0b00110000) >> 4;
    registers.set16Bits(register, memoryMap.read16bitsAt(registers.SP));
    registers.SP += 2;
    return { executionTime: 3 };
  },
};

const SaveAcc: InstructionHandler = {
  opcode: 0b11100000,
  mask: 0xff,
  name: "SaveAcc",

  execute({ registers, memoryMap }) {
    const address = 0xff00 + memoryMap.readAt(registers.PC);
    registers.PC += 1;
    memoryMap.writeAt(address, registers.get8Bits(RegisterNames.A));
    return { executionTime: 3 };
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

const CmpN: InstructionHandler = {
  opcode: 0b11111110,
  mask: 0xff,
  name: "CmpN",

  execute({ registers, memoryMap }) {
    const value = memoryMap.readAt(registers.PC);
    const A = registers.get8Bits(RegisterNames.A);
    registers.PC += 1;
    registers.setFlag(FlagNames.Z, A === value ? 1 : 0);
    registers.setFlag(FlagNames.N, 1);
    registers.setFlag(FlagNames.C, value > A ? 1 : 0);
    registers.setFlag(FlagNames.H, (value & 0xf) > (A & 0xf) ? 1 : 0);
    return { executionTime: 2 };
  },
};

const Di: InstructionHandler = {
  opcode: 0b11110011,
  mask: 0xff,
  name: "Di",

  execute({ registers }) {
    registers.IME = false;
    return { executionTime: 1 };
  },
};

const instructions: InstructionHandler[] = [
  Jump,
  CallNN,
  PushRR,
  PopRR,
  SaveAcc,
  LoadAcc,
  CmpN,
  Di,
];

const log = logger("InstructionBlock3");

export const InstructionBlock3: InstructionHandler = {
  opcode: 0b11000000,
  mask: 0b11000000,

  execute: makeInstructionHandlerFromList(instructions, log),
};
