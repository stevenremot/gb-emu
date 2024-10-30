import { MemoryMap } from "../../memory/memory-map";
import { Registers } from "../registers";

export type InstructionExecutionArgs = {
  opcode: number;
  memoryMap: MemoryMap;
  registers: Registers;
};

export type InstructionResult = {
  executionTime: number;
  instruction?: { opcode: number; name?: string };
};

export type InstructionHandler = {
  opcode: number;
  mask: number;
  name?: string;

  execute(args: InstructionExecutionArgs): InstructionResult;
};
