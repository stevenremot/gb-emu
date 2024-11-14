import { DirectMemoryRange } from "./direct-memory-range";

export class HighRam extends DirectMemoryRange {
  constructor() {
    super(0x7f, 0xff80);
  }
}
