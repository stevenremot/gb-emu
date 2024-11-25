import { MemoryRange } from "./types";

export class DirectMemoryRange implements MemoryRange {
  private static enableDebug = false;

  private internalData: Uint8Array;

  constructor(
    length: number,
    private readonly offset = 0,
  ) {
    this.internalData = new Uint8Array(length);
  }

  private assertAddressInRange(address: number) {
    if (!DirectMemoryRange.enableDebug) return;
    if (
      address < this.offset ||
      address - this.offset >= this.internalData.length
    ) {
      throw new Error(
        `${this}: Address 0x${address.toString(16)} not in range`,
      );
    }
  }

  private assertRangeInRange(address: number, length: number) {
    if (!DirectMemoryRange.enableDebug) return;
    this.assertAddressInRange(address);
    this.assertAddressInRange(address + length - 1);
  }

  readAt(address: number) {
    this.assertAddressInRange(address);
    return this.internalData[address - this.offset];
  }

  writeAt(address: number, value: number) {
    this.assertAddressInRange(address);
    this.internalData[address - this.offset] = value;
    return this;
  }

  readRange(address: number, length: number) {
    this.assertRangeInRange(address, length);
    return this.internalData.subarray(
      address - this.offset,
      address + length - this.offset,
    );
  }

  writeRange(address: number, values: Uint8Array) {
    this.assertRangeInRange(address, values.length);
    this.internalData.set(values, address - this.offset);
    return this;
  }

  reset(values: Uint8Array) {
    this.internalData.fill(0);
    this.internalData.set(values);
    return this;
  }

  toString() {
    return `DirectMemoryRange(${this.internalData.length.toString(16)}, ${this.offset.toString(16)})`;
  }
}
