import { MemoryMap } from "../memory/memory-map";
import { executeInstruction } from "./instructions";
import { InstructionResult } from "./instructions/types";
import { Registers } from "./registers";

export type ProcessorObserver = {
  afterInstruction?(result: InstructionResult): void;
};

export class Processor {
  #registers: Registers;
  private readonly observers: ProcessorObserver[] = [];

  constructor(private readonly memoryMap: MemoryMap) {
    this.#registers = new Registers();
  }

  runOneInstruction() {
    const opcode = this.memoryMap.readAt(this.#registers.PC);
    this.#registers.PC += 1;
    const result = executeInstruction({
      opcode,
      registers: this.#registers,
      memoryMap: this.memoryMap,
    });

    for (const observer of this.observers) {
      observer.afterInstruction?.(result);
    }

    return result;
  }

  get registers() {
    return this.#registers;
  }

  addObserver(observer: ProcessorObserver) {
    this.observers.push(observer);
  }
}
