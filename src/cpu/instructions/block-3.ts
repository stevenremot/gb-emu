import { logger } from "../../utils/logger";
import { subtractUint8 } from "../operations";
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

const Ret: InstructionHandler = {
  opcode: 0b11001001,
  mask: 0xff,
  name: "Ret",

  execute({ registers, memoryMap }) {
    registers.PC = memoryMap.read16bitsAt(registers.SP);
    registers.SP += 2;
    return { executionTime: 4 };
  },
};

const RetCond: InstructionHandler = {
  opcode: 0b11000000,
  mask: 0b11100111,
  name: "RetCond",

  execute({ opcode, registers, memoryMap }) {
    const cc = (opcode & 0b00011000) >> 3;
    let condition = false;
    switch (cc) {
      case 0:
        condition = registers.z === 0;
        break;
      case 1:
        condition = registers.z === 1;
        break;
      case 2:
        condition = registers.c === 0;
        break;
      case 3:
        condition = registers.c === 1;
        break;
    }

    if (condition) {
      registers.PC = memoryMap.read16bitsAt(registers.SP);
      registers.SP += 2;
      return { executionTime: 5 };
    }

    return { executionTime: 2 };
  },
};

const CallNN: InstructionHandler = {
  opcode: 0b11001101,
  mask: 0xff,
  name: "CallNN",

  execute({ registers, memoryMap }) {
    const value = memoryMap.read16bitsAt(registers.PC);
    registers.PC += 2;

    registers.SP -= 2;
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

const SaveRelAcc: InstructionHandler = {
  opcode: 0b11100000,
  mask: 0xff,
  name: "SaveRelAcc",

  execute({ registers, memoryMap }) {
    const address = 0xff00 + memoryMap.readAt(registers.PC);
    registers.PC += 1;
    memoryMap.writeAt(address, registers.get8Bits(RegisterNames.A));
    return { executionTime: 3 };
  },
};

const LoadRelAcc: InstructionHandler = {
  opcode: 0b11110000,
  mask: 0xff,

  execute({ opcode, registers, memoryMap }) {
    const addressOffset = memoryMap.readAt(registers.PC);
    registers.PC += 1;
    const value = memoryMap.readAt(0xff00 + addressOffset);
    registers.set8Bits(RegisterNames.A, value);

    return {
      instruction: {
        opcode,
        name: `LD A, ($FF00+$${addressOffset.toString(16)})`,
      },
      executionTime: 3,
    };
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

const LoadCA: InstructionHandler = {
  opcode: 0b11100010,
  mask: 0xff,
  name: "LoadCA",

  execute({ registers, memoryMap }) {
    memoryMap.writeAt(0xff00 + registers.C, registers.A);
    return { executionTime: 2 };
  },
};

const LoadNnA: InstructionHandler = {
  opcode: 0b11101010,
  mask: 0xff,
  name: "LoadNnA",

  execute({ memoryMap, registers }) {
    const address = memoryMap.read16bitsAt(registers.PC);
    registers.PC += 2;
    memoryMap.writeAt(address, registers.A);

    return { executionTime: 4 };
  },
};

const CmpN: InstructionHandler = {
  opcode: 0b11111110,
  mask: 0xff,

  execute({ opcode, registers, memoryMap }) {
    const value = memoryMap.readAt(registers.PC);
    const A = registers.get8Bits(RegisterNames.A);
    registers.PC += 1;
    const { result, carry, halfCarry } = subtractUint8(A, value);
    registers.setFlag(FlagNames.Z, result === 0 ? 1 : 0);
    registers.setFlag(FlagNames.N, 1);
    registers.setFlag(FlagNames.C, carry);
    registers.setFlag(FlagNames.H, halfCarry);
    return {
      instruction: { opcode, name: `CP $${value.toString(16)}` },
      executionTime: 2,
    };
  },
};

const SubN: InstructionHandler = {
  opcode: 0b11010110,
  mask: 0xff,
  name: "SubN",

  execute({ registers, memoryMap }) {
    const value = memoryMap.readAt(registers.PC);
    registers.PC += 1;

    const { result, carry, halfCarry } = subtractUint8(registers.A, value);
    registers.A = result;
    registers.z = result === 0 ? 1 : 0;
    registers.n = 1;
    registers.h = halfCarry;
    registers.c = carry;

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
  Ret,
  RetCond,
  CallNN,
  PushRR,
  PopRR,
  SaveRelAcc,
  LoadRelAcc,
  LoadAcc,
  LoadCA,
  LoadNnA,
  CmpN,
  SubN,
  Di,
];

const log = logger("InstructionBlock3");

export const InstructionBlock3: InstructionHandler = {
  opcode: 0b11000000,
  mask: 0b11000000,

  execute: makeInstructionHandlerFromList(instructions, log),
};
