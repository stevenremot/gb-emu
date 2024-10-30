export const RegisterNames = {
  B: 0,
  C: 1,
  D: 2,
  E: 3,
  H: 4,
  L: 5,
  A: 7,

  BC: 0,
  DE: 1,
  HL: 2,
  SP: 3,
  AF: 3,
} as const;

export class Registers {
  PC: number;
  SP: number;
  #dataRegisters: Uint8Array;

  constructor() {
    this.PC = 0x100;
    this.SP = 0xfffe;
    this.#dataRegisters = new Uint8Array(8);
  }

  get8Bits(register: number) {
    return this.#dataRegisters[register];
  }

  set8Bits(register: number, value: number) {
    this.#dataRegisters[register] = value;
    return this;
  }

  get16Bits(register: number) {
    return (
      (this.#dataRegisters[register * 2] << 8) |
      this.#dataRegisters[register * 2 + 1]
    );
  }

  set16Bits(register: number, value: number) {
    this.#dataRegisters[register * 2] = value >> 8;
    this.#dataRegisters[register * 2 + 1] = value;
    return this;
  }
}
