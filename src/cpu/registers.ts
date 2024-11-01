export const RegisterNames = {
  B: 0,
  C: 1,
  D: 2,
  E: 3,
  H: 4,
  L: 5,
  F: 6,
  A: 7,

  BC: 0,
  DE: 1,
  HL: 2,
  SP: 3,
  AF: 3,
} as const;

export const FlagNames = {
  Z: 7,
  N: 6,
  H: 5,
  C: 4,
} as const;

export class Registers {
  PC: number;
  SP: number;

  // Not really a register, but kept here for simplicity
  IME: boolean;

  #dataRegisters: Uint8Array;

  constructor() {
    this.PC = 0x100;
    this.SP = 0xfffe;
    this.IME = false;
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

  getFlag(flag: number) {
    const F = this.get8Bits(RegisterNames.F);
    return ((F & (0b10000000 >> flag)) >> (7 - flag)) as 0 | 1;
  }

  setFlag(flag: number, value: 0 | 1) {
    const F = this.get8Bits(RegisterNames.F);
    const mask = (0b10000000 >> flag) ^ 0xff;
    const offsetValue = value << (7 - flag);
    return this.set8Bits(RegisterNames.F, (F & mask) | offsetValue);
  }

  get A() {
    return this.get8Bits(RegisterNames.A);
  }

  set A(value: number) {
    this.set8Bits(RegisterNames.A, value);
  }

  get HL() {
    return this.get16Bits(RegisterNames.HL);
  }

  set HL(value: number) {
    this.set16Bits(RegisterNames.HL, value);
  }

  get Z() {
    return this.getFlag(FlagNames.Z);
  }

  set Z(flag: 0 | 1) {
    this.setFlag(FlagNames.Z, flag);
  }

  get N() {
    return this.getFlag(FlagNames.N);
  }

  set N(flag: 0 | 1) {
    this.setFlag(FlagNames.N, flag);
  }

  get H() {
    return this.getFlag(FlagNames.H);
  }

  set H(flag: 0 | 1) {
    this.setFlag(FlagNames.H, flag);
  }

  get C() {
    return this.getFlag(FlagNames.C);
  }

  set C(flag: 0 | 1) {
    this.setFlag(FlagNames.C, flag);
  }
}
