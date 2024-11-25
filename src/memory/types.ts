type DangerouslyMutableUint8Array = Uint8Array;

export interface MemoryRange {
  readAt(value: number): number;
  writeAt(address: number, value: number): this;

  /**
   * /!\ WARNING : some implementers may return an array that can
   * mutate the original memory. Do not try to mutate it.
   */
  readRange(address: number, length: number): DangerouslyMutableUint8Array;
  writeRange(address: number, values: Uint8Array): this;
}
