import { DirectMemoryRange } from "./direct-memory-range";
import { ExternalRam } from "./external-ram";
import { HighRam } from "./high-ram";
import { InterruptEnableRegister } from "./interrupt-enable-register";
import { IoRegisters } from "./io-registers";
import { ObjectAttributeMemory } from "./object-attribute-memory";
import { ProgramMemoryRange } from "./program-memory-range";
import { MemoryRange } from "./types";
import { VideoRam } from "./video-ram";
import { WorkRam } from "./work-ram";

/**
 * Main entry for the game boy memory map
 *
 * Takes care of redirecting the read and write commands to the right
 * memory banks.
 */
export class MemoryMap implements MemoryRange {
  public readonly programMemoryRange = new ProgramMemoryRange();
  public readonly videoRam = new VideoRam();
  public readonly externalRam = new ExternalRam();
  public readonly workRam = new WorkRam();
  public readonly objectAttributeMemory = new ObjectAttributeMemory();
  public readonly ioRegisters = new IoRegisters();
  public readonly highRam = new HighRam();
  public readonly interruptEnableRegister = new InterruptEnableRegister();

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
    } else if (address < 0xa000) {
      return this.videoRam;
    } else if (address < 0xc000) {
      return this.externalRam;
    } else if (address < 0xfe00) {
      return this.workRam;
    } else if (address < 0xff00) {
      return this.objectAttributeMemory;
    } else if (address < 0xff80) {
      return this.ioRegisters;
    } else if (address < 0xffff) {
      return this.highRam;
    }

    return this.interruptEnableRegister;
  }
}
