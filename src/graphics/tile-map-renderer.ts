import { MemoryMap } from "../memory/memory-map";
import { LcdMemoryView } from "./lcd-memory-view";
import { TileDataView } from "./tile-data-view";

export class TileMapRenderer {
  private readonly tileDataView: TileDataView;
  private readonly lcdMemoryView: LcdMemoryView;

  constructor(private readonly memoryMap: MemoryMap) {
    this.tileDataView = new TileDataView(memoryMap.videoRam);
    this.lcdMemoryView = new LcdMemoryView(memoryMap.ioRegisters);
  }

  /**
   * Return the whole background
   */
  getBackgroundPicture() {
    const startAddress = 0x9800;

    const background = Array.from({ length: 256 }, () =>
      Array.from({ length: 256 }, () => 0),
    );

    for (let line = 0; line < 32; line += 1) {
      const lineTiles = this.memoryMap.readRange(startAddress + line * 32, 32);
      console.groupCollapsed(lineTiles);

      for (let column = 0; column < lineTiles.length; column += 1) {
        const blockId = lineTiles[column];
        const tile = this.tileDataView.getTile(
          blockId,
          1 - this.lcdMemoryView.controlFlags.bgWindowAddressingMode,
        );

        console.log(line, column, tile);

        for (let pixelLine = 0; pixelLine < tile.length; pixelLine += 1) {
          for (
            let pixelColumn = 0;
            pixelColumn < tile[pixelLine].length;
            pixelColumn += 1
          ) {
            background[line * 8 + pixelLine][column * 8 + pixelColumn] =
              tile[pixelLine][pixelColumn];
          }
        }
      }

      console.groupEnd();
    }

    return background;
  }
}
