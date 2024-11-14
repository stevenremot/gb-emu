export interface MemoryRange {
  readAt(value: number): number;
  writeAt(address: number, value: number): this;

  readRange(address: number, length: number): Uint8Array;
  writeRange(address: number, values: Uint8Array): this;
}
