import { describe, expect, it } from "vitest";
import { MemoryMap } from "../memory/memory-map";
import { TileMapRenderer } from "./tile-map-renderer";

describe("graphics/TileMapRenderer", () => {
  it.each([0, 1, 63, 143])(
    "Should render an background line with empty memory (line %i)",
    (lineNumber) => {
      const memoryMap = new MemoryMap();
      const renderer = new TileMapRenderer(memoryMap);

      const line = renderer.getBackgroundLine(lineNumber);

      expect(line).toEqual(Uint8Array.from({ length: 160 }, () => 0));
    },
  );

  it("Should render the tiles on the background line", () => {
    const memoryMap = new MemoryMap();
    const renderer = new TileMapRenderer(memoryMap);

    // Create a tile
    memoryMap.writeRange(
      0x8010,
      new Uint8Array([
        0b00111100, 0b01111110, 0b01000010, 0b01000010, 0b01000010, 0b01000010,
        0b01000010, 0b01000010, 0b01111110, 0b01011110, 0b01111110, 0b00001010,
        0b01111100, 0b01010110, 0b00111000, 0b01111100,
      ]),
    );

    // Use our previously created tile
    memoryMap.writeAt(0x9801, 1);

    const line = renderer.getBackgroundLine(3);

    expect(line).toEqual(
      new Uint8Array([
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 3, 0, 0, 0, 0, 3, 0],
        ...Array.from({ length: 144 }, () => 0),
      ]),
    );
  });

  it("Should render the background line with the correct scroll settings", () => {
    const memoryMap = new MemoryMap();
    const renderer = new TileMapRenderer(memoryMap);

    // Create a tile
    memoryMap.writeRange(
      0x8010,
      new Uint8Array([
        0b00111100, 0b01111110, 0b01000010, 0b01000010, 0b01000010, 0b01000010,
        0b01000010, 0b01000010, 0b01111110, 0b01011110, 0b01111110, 0b00001010,
        0b01111100, 0b01010110, 0b00111000, 0b01111100,
      ]),
    );

    // Use our previously created tile
    memoryMap.writeAt(0x9801, 1);

    // Set the scroll parameters
    memoryMap.writeAt(0xff42, 2).writeAt(0xff43, 7);

    const line = renderer.getBackgroundLine(3);

    expect(line).toEqual(
      new Uint8Array([
        0,
        ...[0, 1, 1, 1, 3, 1, 3, 0],
        ...Array.from({ length: 151 }, () => 0),
      ]),
    );
  });
});
