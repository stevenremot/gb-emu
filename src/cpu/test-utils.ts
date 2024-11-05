import { MemoryMap } from "../memory/memory-map";
import { Processor } from "./processor";

export function makeInstructionTestInstance(program: Uint8Array) {
  const memoryMap = new MemoryMap();
  const processor = new Processor(memoryMap);
  processor.registers.PC = 0x100;
  memoryMap.writeRange(processor.registers.PC, program);

  return {
    processor,
    memoryMap,
  };
}
