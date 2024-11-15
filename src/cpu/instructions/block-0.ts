import { logger } from "../../utils/logger";
import { addUint8, getSigned8, subtractUint8 } from "../operations";
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
  opcode: 0b00001000,
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

const LoadAHli: InstructionHandler = {
  opcode: 0b00101010,
  mask: 0xff,
  name: "LoadAHli",

  execute({ registers, memoryMap }) {
    registers.A = memoryMap.readAt(registers.HL);
    registers.HL += 1;
    return { executionTime: 2 };
  },
};

const LoadAHld: InstructionHandler = {
  opcode: 0b00111010,
  mask: 0xff,
  name: "LoadAHld",

  execute({ registers, memoryMap }) {
    registers.A = memoryMap.readAt(registers.HL);
    registers.HL -= 1;
    return { executionTime: 2 };
  },
};

const LoadAR: InstructionHandler = {
  opcode: 0b00001010,
  mask: 0b11001111,
  name: "LoadAR",

  execute({ opcode, registers, memoryMap }) {
    const register = (opcode & 0b00110000) >> 4;
    registers.A = memoryMap.readAt(registers.get16Bits(register));
    return { executionTime: 2 };
  },
};

const LoadHldA: InstructionHandler = {
  opcode: 0b00110010,
  mask: 0xff,
  name: "LoadHldA",

  execute({ registers, memoryMap }) {
    memoryMap.writeAt(registers.HL, registers.A);
    registers.HL -= 1;
    return { executionTime: 2 };
  },
};

const LoadHliA: InstructionHandler = {
  opcode: 0b00100010,
  mask: 0xff,
  name: "LoadHliA",

  execute({ registers, memoryMap }) {
    memoryMap.writeAt(registers.HL, registers.A);
    registers.HL += 1;
    return { executionTime: 2 };
  },
};

const JumpRel: InstructionHandler = {
  opcode: 0b00011000,
  mask: 0xff,
  name: "JumpRel",

  execute({ registers, memoryMap }) {
    const offset = getSigned8(memoryMap.readAt(registers.PC));
    registers.PC += 1 + offset;
    return { executionTime: 3 };
  },
};

const JumpRelCond: InstructionHandler = {
  opcode: 0b00100000,
  mask: 0b11100111,

  execute({ opcode, registers, memoryMap }) {
    const condition = (opcode & 0b00011000) >> 3;

    let isConditionMet = false;
    let condName = "";

    switch (condition) {
      case 0:
        isConditionMet = registers.getFlag(FlagNames.Z) === 0;
        condName = "NZ";
        break;
      case 1:
        isConditionMet = registers.getFlag(FlagNames.Z) === 1;
        condName = "Z";
        break;
      case 2:
        isConditionMet = registers.getFlag(FlagNames.C) === 0;
        condName = "NC";
        break;
      case 3:
        isConditionMet = registers.getFlag(FlagNames.C) === 1;
        condName = "C";
        break;
    }

    const offset = getSigned8(memoryMap.readAt(registers.PC));
    const instruction = {
      opcode,
      name: `JR ${condName}, $${offset.toString(16)}`,
    };

    if (isConditionMet) {
      registers.PC += 1 + offset;
      return { instruction, executionTime: 3 };
    }

    registers.PC += 1;

    return { instruction, executionTime: 2 };
  },
};

const RlA: InstructionHandler = {
  opcode: 0b00010111,
  mask: 0b11111111,
  name: "RlA",

  execute: ({ registers }) => {
    const value = registers.A;
    const carry = ((value & 0b10000000) >> 7) as 0 | 1;
    const newValue = (value << 1) | registers.c;

    registers.A = newValue;
    registers.n = 0;
    registers.h = 0;
    registers.c = carry;
    registers.z = 0;

    return { executionTime: 1 };
  },
};

const IncRr: InstructionHandler = {
  opcode: 0b00000011,
  mask: 0b11001111,
  name: "IncRr",

  execute({ opcode, registers }) {
    const register = (opcode & 0b00110000) >> 4;
    const value = registers.get16Bits(register);

    registers.set16Bits(register, (value + 1) & 0xffff);

    return { executionTime: 2 };
  },
};

const DecRr: InstructionHandler = {
  opcode: 0b00001011,
  mask: 0b11001111,
  name: "DecRr",

  execute({ opcode, registers }) {
    const register = (opcode & 0b00110000) >> 4;

    registers.set16Bits(
      register,
      (registers.get16Bits(register) - 1) % 0x10000,
    );
    return { executionTime: 2 };
  },
};

const Ccf: InstructionHandler = {
  opcode: 0b00111111,
  mask: 0xff,
  name: "Ccf",

  execute({ registers }) {
    registers.c = registers.c ? 0 : 1;
    registers.n = 0;
    registers.h = 0;
    return { executionTime: 1 };
  },
};

const IncHl: InstructionHandler = {
  opcode: 0b00110100,
  mask: 0xff,
  name: "IncHl",

  execute({ registers, memoryMap }) {
    const { result, halfCarry } = addUint8(memoryMap.readAt(registers.HL), 1);
    memoryMap.writeAt(registers.HL, result);
    registers.z = result === 0 ? 1 : 0;
    registers.n = 0;
    registers.h = halfCarry;
    return { executionTime: 3 };
  },
};

const DecR: InstructionHandler = {
  opcode: 0b00000101,
  mask: 0b11000111,
  name: "DecR",

  execute({ opcode, registers }) {
    const register = (opcode & 0b00111000) >> 3;
    const value = registers.get8Bits(register);
    const { result, halfCarry } = subtractUint8(value, 1);

    registers.set8Bits(register, result);

    registers.z = result === 0 ? 1 : 0;
    registers.n = 1;
    registers.h = halfCarry;

    return { executionTime: 1 };
  },
};

const DecHl: InstructionHandler = {
  opcode: 0b00110101,
  mask: 0xff,
  name: "DecHl",

  execute({ registers, memoryMap }) {
    const value = memoryMap.readAt(registers.HL);
    const { result, halfCarry } = subtractUint8(value, 1);

    memoryMap.writeAt(registers.HL, result);

    registers.z = result === 0 ? 1 : 0;
    registers.n = 1;
    registers.h = halfCarry;

    return { executionTime: 3 };
  },
};

const IncR: InstructionHandler = {
  opcode: 0b00000100,
  mask: 0b11000111,
  name: "IncR",

  execute({ opcode, registers }) {
    const register = (opcode & 0b00111000) >> 3;
    const { result, halfCarry } = addUint8(registers.get8Bits(register), 1);
    registers.set8Bits(register, result);
    registers.z = result === 0 ? 1 : 0;
    registers.n = 0;
    registers.h = halfCarry;

    return { executionTime: 1 };
  },
};

const instructions: InstructionHandler[] = [
  Noop,
  LoadNToRRR,
  LoadNNToRR,
  LoadFromSP,
  LoadAHli,
  LoadAHld,
  LoadAR,
  LoadHldA,
  LoadHliA,
  JumpRel,
  JumpRelCond,
  IncRr,
  DecRr,
  RlA,
  Ccf,
  IncHl,
  DecHl,
  IncR,
  DecR,
];

const log = logger("InstructionBlock0");

export const InstructionBlock0: InstructionHandler = {
  opcode: 0x00,
  mask: 0b11000000,

  execute: makeInstructionHandlerFromList(instructions, log),
};
