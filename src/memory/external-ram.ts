import { DirectMemoryRange } from "./direct-memory-range";

export class ExternalRam extends DirectMemoryRange {
  constructor() {
    super(0x2000, 0xa000);
  }
}
