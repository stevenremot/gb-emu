import { Registers } from "../../cpu/registers";

export function debugRegisters(registers: Registers) {
  const eventPayload = {
    PC: registers.PC,
    SP: registers.SP,
    "16bits": [] as number[],
    "8bits": [] as number[],
  };

  for (let i = 0; i < 4; i += 1) {
    eventPayload["16bits"].push(registers.get16Bits(i));
  }

  for (let i = 0; i < 8; i += 1) {
    eventPayload["8bits"].push(registers.get8Bits(i));
  }

  postMessage({ type: "debug:registers-changed", payload: eventPayload });
}
