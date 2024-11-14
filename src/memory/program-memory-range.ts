import { DirectMemoryRange } from "./direct-memory-range";
import { MemoryRange } from "./types";

/*
 * Memory range of the cartridge program, that can be overridden by the boot rom at startup.
 *
 * /!\ Bad design, I should rewrite it so that I have the boot rom
 * somewhere, ad the cartridge ROM and RAM handled elsewhere to better
 * stick to the hardware.
 */
export class ProgramMemoryRange implements MemoryRange {
  private isBootRomActive = true;

  private readonly bootRom = new DirectMemoryRange(0x100);
  private readonly programRom = new DirectMemoryRange(0x7fff);

  setBootRom(bootRom: Uint8Array) {
    this.bootRom.reset(bootRom);
    return this;
  }

  setProgramRom(programRom: Uint8Array) {
    this.programRom.reset(programRom);
    return this;
  }

  setIsBootRomActive(isActive: boolean) {
    this.isBootRomActive = isActive;
    return this;
  }

  readAt(address: number) {
    return this.selectMemoryRange(address).readAt(address);
  }

  writeAt(address: number, value: number) {
    this.selectMemoryRange(address).writeAt(address, value);
    return this;
  }

  readRange(address: number, length: number) {
    return this.selectMemoryRange(address).readRange(address, length);
  }

  writeRange(address: number, values: Uint8Array) {
    this.selectMemoryRange(address).writeRange(address, values);
    return this;
  }

  private selectMemoryRange(address: number) {
    return this.isBootRomActive && address < 0x100
      ? this.bootRom
      : this.programRom;
  }
}
