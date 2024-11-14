import { DirectMemoryRange } from "./direct-memory-range";

export class ObjectAttributeMemory extends DirectMemoryRange {
  constructor() {
    super(0x100, 0xfe00); // Actually 0xA0 long, but we overlap with the not usable range to simplify the implementation
  }
}
