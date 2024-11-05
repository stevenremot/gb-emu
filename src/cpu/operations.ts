export function getSigned8(value: number) {
  const absolute = value & 0b01111111;
  const sign = value & 0b10000000;

  return sign ? -absolute : absolute;
}

export function addUint8(a: number, b: number) {
  const fullResult = a + b;
  const croppedResult = fullResult & 0xff;
  return {
    result: croppedResult,
    carry: fullResult >= 0x100 ? (1 as const) : (0 as const),
    halfCarry: (a & 0xf) + (b & 0xf) >= 0x10 ? (1 as const) : (0 as const),
  };
}

export function subtractUint8(a: number, b: number) {
  const fullResult = (a - b) % 0x100;
  const croppedResult = fullResult & 0xff;

  return {
    result: croppedResult,
    carry: b > a ? (1 as const) : (0 as const),
    halfCarry: (b & 0xf) > (a & 0xf) ? (1 as const) : (0 as const),
  };
}
