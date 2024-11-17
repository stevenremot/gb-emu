import { describe, expect, it } from "vitest";
import { MemoryMap } from "../memory/memory-map";
import { TileDataView } from "./tile-data-view";

describe("graphics/TileDataView", () => {
  it.each([
    {
      memoryIndex: 0x8000 + 125 * 16,
      addressMode: 1,
      blockId: 125,
    },
    {
      memoryIndex: 0x8000 + 204 * 16,
      addressMode: 1,
      blockId: 204,
    },
    {
      memoryIndex: 0x8000 + 204 * 16,
      addressMode: 0,
      blockId: 204,
    },
    {
      memoryIndex: 0x8000 + 257 * 16,
      addressMode: 0,
      blockId: 1,
    },
  ])(
    "Should return the tile at the given address ($blockId, $addressMode)",
    ({ memoryIndex, addressMode, blockId }) => {
      const memoryMap = new MemoryMap();
      memoryMap.writeRange(
        memoryIndex,
        new Uint8Array([
          0b00111100, 0b01111110, 0b01000010, 0b01000010, 0b01000010,
          0b01000010, 0b01000010, 0b01000010, 0b01111110, 0b01011110,
          0b01111110, 0b00001010, 0b01111100, 0b01010110, 0b00111000,
          0b01111100,
        ]),
      );

      const tileDataView = new TileDataView(memoryMap.videoRam);

      expect(tileDataView.getTile(blockId, addressMode)).toEqual([
        [0, 2, 3, 3, 3, 3, 2, 0],
        [0, 3, 0, 0, 0, 0, 3, 0],
        [0, 3, 0, 0, 0, 0, 3, 0],
        [0, 3, 0, 0, 0, 0, 3, 0],
        [0, 3, 1, 3, 3, 3, 3, 0],
        [0, 1, 1, 1, 3, 1, 3, 0],
        [0, 3, 1, 3, 1, 3, 2, 0],
        [0, 2, 3, 3, 3, 2, 0, 0],
      ]);
    },
  );
});
