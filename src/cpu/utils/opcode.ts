export function formatOpcode(opcode: number) {
  return `${opcode.toString(16).padStart(2, "0")}/${opcode.toString(2).padStart(8, "0")}`;
}
