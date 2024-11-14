import { DirectMemoryRange } from "./direct-memory-range";

export class InterruptEnableRegister extends DirectMemoryRange {
  constructor() {
    super(1, 0xffff);
  }
}
