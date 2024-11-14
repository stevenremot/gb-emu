import { DirectMemoryRange } from "./direct-memory-range";

export class IoRegisters extends DirectMemoryRange {
  constructor() {
    super(0x80, 0xff00);
  }
}
