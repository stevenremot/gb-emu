import { MemoryMap } from "../../memory/memory-map";
import { Registers } from "../registers";

export type InstructionEffectInstruction = {
  opcode: number;
  name?: string;
};

export type InstructionEffectState = {
  registers: Registers;
  memoryMap: MemoryMap;
};

export type InstructionEffectResult = {
  executionTime: number;
  instruction?: InstructionEffectInstruction;
};

export type InstructionEffectCallback = (
  result: InstructionEffectResult,
) => void;

export class InstructionEffect {
  #instruction?: InstructionEffectInstruction;

  constructor(
    private readonly body: (
      state: InstructionEffectState,
      callback: InstructionEffectCallback,
    ) => void,
  ) {}

  run(state: InstructionEffectState, callback: InstructionEffectCallback) {
    this.body(state, callback);
  }

  setInstruction(instruction: InstructionEffectInstruction) {
    this.#instruction = instruction;
    return this;
  }

  get instruction() {
    return this.#instruction;
  }
}

export function syncInstructionEffect(
  body: (state: InstructionEffectState) => InstructionEffectResult,
): InstructionEffect {
  return new InstructionEffect((state, callback) => callback(body(state)));
}

export function nullInstructionEffect(): InstructionEffect {
  return new InstructionEffect((_, callback) => callback({ executionTime: 1 }));
}
