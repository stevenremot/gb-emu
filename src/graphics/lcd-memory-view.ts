import { IoRegisters } from "../memory/io-registers";
import { LcdControlFlags } from "./lcd-control-flags";
import { LcdStatusFlags } from "./lcd-status-flags";

export class LcdMemoryView {
  constructor(private readonly ioRegisters: IoRegisters) {}

  get controlFlags() {
    return new LcdControlFlags(this.ioRegisters.readAt(0xff40));
  }

  get statusFlags() {
    return new LcdStatusFlags(this.ioRegisters.readAt(0xff41));
  }

  get SCY() {
    return this.ioRegisters.readAt(0xff42);
  }

  get SCX() {
    return this.ioRegisters.readAt(0xff43);
  }

  get LY() {
    return this.ioRegisters.readAt(0xff44);
  }

  set LY(value: number) {
    this.ioRegisters.writeAt(0xff44, value);
  }

  get LYC() {
    return this.ioRegisters.readAt(0xff45);
  }

  get backgroundPalette() {
    const paletteByte = this.ioRegisters.readAt(0xff47);
    return [
      paletteByte & 0b11,
      (paletteByte & 0b1100) >> 2,
      (paletteByte & 0b110000) >> 4,
      (paletteByte & 0b11000000) >> 6,
    ];
  }
}
