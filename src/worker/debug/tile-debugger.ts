import { paletteColors } from "../../graphics/constants";
import { MemoryMap } from "../../memory/memory-map";
import { assertNotNull } from "../../utils/assertions";
import { MessageHandler } from "../types";

export class TileDebugger implements MessageHandler {
  private readonly canvas: OffscreenCanvas;
  private readonly ctx: OffscreenCanvasRenderingContext2D;

  constructor(private readonly memoryMap: MemoryMap) {
    this.canvas = new OffscreenCanvas(64, 384);
    this.ctx = assertNotNull(this.canvas.getContext("2d"));
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

  private refreshTiles() {
    this.ctx.fillStyle = paletteColors[1];
    this.ctx.fillRect(0, 0, 64, 384);

    postMessage({
      type: "debug:tiles-refreshed",
      payload: this.canvas.transferToImageBitmap(),
    });
  }
}
