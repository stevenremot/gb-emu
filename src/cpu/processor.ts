import { MemoryMap } from "../memory/memory-map";
import { executeInstruction } from "./instructions";
import { Registers } from "./registers";

export class Processor {
  #registers: Registers;
  #memoryMap: MemoryMap;

  constructor(memoryMap: MemoryMap) {
    this.#registers = new Registers();
    this.#memoryMap = memoryMap;
  }

  runOneInstruction() {
    const opcode = this.#memoryMap.readAt(this.#registers.PC);
    this.#registers.PC += 1;
    return executeInstruction({
      opcode,
      registers: this.#registers,
      memoryMap: this.#memoryMap,
    });
  }

  get registers() {
    return this.#registers;
  }
}
