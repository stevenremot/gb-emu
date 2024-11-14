import { DirectMemoryRange } from "./direct-memory-range";

export class VideoRam extends DirectMemoryRange {
  constructor() {
    super(0x2000, 0x8000);
  }
}
