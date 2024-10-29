import { InstructionEffect } from "./instruction-effect";

export type InstructionHandler = {
  opcode: number;
  mask: number;
  name?: string;

  execute(opcode: number): InstructionEffect;
};
