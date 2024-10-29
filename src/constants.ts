export const DeviceModes = {
  DMG: 0,
  CGB: 1,
} as const;

export type DeviceMode = (typeof DeviceModes)[keyof typeof DeviceModes];
