/**
 * Main entry for the game boy memory map
 *
 * Takes care of redirecting the read and write commands to the right
 * memory banks.
 */
export class MemoryMap {
  #tmpMemory: Uint8Array;

  constructor() {
    this.#tmpMemory = new Uint8Array(0x10000);
  }

  loadProgram(program: Uint8Array) {
    this.#tmpMemory.set(program, 0);
  }

  readAt(address: number) {
    return this.#tmpMemory[address];
  }

  writeAt(address: number, value: number) {
    this.#tmpMemory[address] = value;
    return this;
  }

  readRange(address: number, length: number) {
    return this.#tmpMemory.slice(address, address + length);
  }

  writeRange(address: number, value: Uint8Array) {
    this.#tmpMemory.set(value, address);
    return this;
  }
}
