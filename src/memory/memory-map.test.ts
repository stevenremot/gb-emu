import { describe, expect, it } from "vitest";
import { MemoryMap } from "./memory-map";

describe("memory/MemoryMap", () => {
  it("Should allow reading and writing one value", () => {
    const memoryMap = new MemoryMap();

    expect(memoryMap.readAt(0x20)).toEqual(0);

    memoryMap.writeAt(0x20, 0xf1);
    expect(memoryMap.readAt(0x20)).toEqual(0xf1);
  });
});
