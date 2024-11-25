import { MemoryMap } from "../memory/memory-map";
import { LcdMemoryView } from "./lcd-memory-view";
import { TileDataView } from "./tile-data-view";

const screenSize = 256;

export class TileMapRenderer {
  private readonly tileDataView: TileDataView;
  private readonly lcdMemoryView: LcdMemoryView;
  private readonly cachedBackgroundLine = new Uint8Array(screenSize);

  constructor(private readonly memoryMap: MemoryMap) {
    this.tileDataView = new TileDataView(memoryMap.videoRam);
    this.lcdMemoryView = new LcdMemoryView(memoryMap.ioRegisters);
  }

  getBackgroundLine(line: number) {
    const { SCY: scrollY, SCX: scrollX } = this.lcdMemoryView;
    const backgroundLine = this.cachedBackgroundLine.fill(0);

    const tileLine = Math.floor((line + scrollY) / 8);
    const lineInTile = (line + scrollY) % 8;

    const lineTiles = this.memoryMap.readRange(0x9800 + tileLine * 32, 32);

    for (let column = 0; column < lineTiles.length; column += 1) {
      const blockId = lineTiles[column];

      const tile = this.tileDataView.getTile(
        blockId,
        this.lcdMemoryView.controlFlags.bgWindowAddressingMode,
      );

      for (let pixelColumn = 0; pixelColumn < 8; pixelColumn += 1) {
        backgroundLine[(column * 8 + pixelColumn - scrollX) % screenSize] =
          tile[lineInTile * 8 + pixelColumn];
      }
    }

    return backgroundLine.subarray(0, 160);
  }
}
