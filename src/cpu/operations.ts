export function subtractUint8(a: number, b: number) {
  const fullResult = (a - b) % 0x100;
  const croppedResult = fullResult & 0xff;

  return {
    result: croppedResult,
    carry: b > a ? (1 as const) : (0 as const),
    halfCarry: (b & 0xf) > (a & 0xf) ? (1 as const) : (0 as const),
  };
}
