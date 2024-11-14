import { DirectMemoryRange } from "./direct-memory-range";

export class WorkRam extends DirectMemoryRange {
  constructor() {
    super(0x3e00, 0xc000); // Do not emulate echo ram for now
  }
}
