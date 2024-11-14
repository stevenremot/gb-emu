import { DirectMemoryRange } from "./direct-memory-range";
import { ProgramMemoryRange } from "./program-memory-range";
import { MemoryRange } from "./types";

/**
 * Main entry for the game boy memory map
 *
 * Takes care of redirecting the read and write commands to the right
 * memory banks.
 */
export class MemoryMap implements MemoryRange {
  public readonly programMemoryRange = new ProgramMemoryRange();

  // Called tmpMemory because the implementation is too simple and
  // does not take in account bank switching and stuffs. It will be rewritten later.
  private tmpMemory = new DirectMemoryRange(0x10000 - 0x8000, 0x8000);

  readAt(address: number) {
    return this.getMemoryRange(address).readAt(address);
  }

  read16bitsAt(address: number) {
    const parts = this.readRange(address, 2);
    return parts[0] | (parts[1] << 8);
  }

  writeAt(address: number, value: number) {
    this.getMemoryRange(address).writeAt(address, value);
    return this;
  }

  write16bitsAt(address: number, value: number) {
    this.writeRange(address, new Uint8Array([value, value >> 8]));
    return this;
  }

  readRange(address: number, length: number) {
    return this.getMemoryRange(address).readRange(address, length);
  }

  writeRange(address: number, values: Uint8Array) {
    this.getMemoryRange(address).writeRange(address, values);
    return this;
  }

  private getMemoryRange(address: number) {
    if (address < 0x8000) {
      return this.programMemoryRange;
    }

    return this.tmpMemory;
  }
}
