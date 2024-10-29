import { MemoryMap } from "../memory/memory-map";
import { executeInstruction } from "./instructions";
import { InstructionEffectResult } from "./instructions/instruction-effect";
import { Registers } from "./registers";

export class Processor {
  #registers: Registers;
  #memoryMap: MemoryMap;

  constructor(memoryMap: MemoryMap) {
    this.#registers = new Registers();
    this.#memoryMap = memoryMap;
  }

  runOneInstruction(callback: (result: InstructionEffectResult) => void) {
    const opcode = this.#memoryMap.readAt(this.#registers.PC);
    this.#registers.PC += 1;
    const effect = executeInstruction(opcode);
    effect.run(
      { registers: this.#registers, memoryMap: this.#memoryMap },
      (result) => callback({ ...result, instruction: effect.instruction }),
    );
  }

  get registers() {
    return this.#registers;
  }
}
