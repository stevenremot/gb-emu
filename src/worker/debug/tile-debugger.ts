import { paletteColors } from "../../graphics/constants";
import { TileDataView } from "../../graphics/tile-data-view";
import { MemoryMap } from "../../memory/memory-map";
import { assertNotNull } from "../../utils/assertions";
import { MessageHandler } from "../types";

const totalTiles = 384;
const tilesByLine = 8;
const tileSize = 8;
const zoomFactor = 4;

const tilesByColumn = Math.ceil(totalTiles / tilesByLine);

export class TileDebugger implements MessageHandler {
  private readonly canvas: OffscreenCanvas;
  private readonly ctx: OffscreenCanvasRenderingContext2D;
  private readonly tileDataView: TileDataView;

  constructor(memoryMap: MemoryMap) {
    this.canvas = new OffscreenCanvas(
      (tilesByLine * tileSize + (tilesByLine - 1)) * zoomFactor,
      (tilesByColumn * tileSize + tilesByColumn - 1) * zoomFactor,
    );
    this.ctx = assertNotNull(this.canvas.getContext("2d"));
    this.ctx.scale(zoomFactor, zoomFactor);
    this.tileDataView = new TileDataView(memoryMap.videoRam);
  }

  onMessage(message: string) {
    switch (message) {
      case "refreshTiles":
        this.refreshTiles();
        break;
      default:
        break;
    }
  }

  private *iterTiles() {
    for (let i = 0; i < 256; i += 1) {
      const tile = this.tileDataView.getTile(i, 1);
      yield {
        line: Math.floor(i / tilesByLine),
        column: i % tilesByLine,
        tile,
      };
    }

    for (let i = 0; i < 128; i += 1) {
      const tile = this.tileDataView.getTile(i, 0);
      yield {
        line: Math.floor((i + 256) / tilesByLine),
        column: (i + 256) % tilesByLine,
        tile,
      };
    }
  }

  private refreshTiles() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const { line, column, tile } of this.iterTiles()) {
      for (let pixelLine = 0; pixelLine < 8; pixelLine += 1) {
        for (let pixelColumn = 0; pixelColumn < 8; pixelColumn += 1) {
          this.ctx.fillStyle = paletteColors[tile[pixelLine][pixelColumn]];
          this.ctx.fillRect(
            column * 8 + pixelColumn + column,
            line * 8 + pixelLine + line,
            1,
            1,
          );
        }
      }
    }

    postMessage({
      type: "debug:tiles-refreshed",
      payload: this.canvas.transferToImageBitmap(),
    });
  }
}
