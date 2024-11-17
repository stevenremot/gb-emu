import { MemoryMap } from "../memory/memory-map";
import { assertNotNull } from "../utils/assertions";
import { MessageHandler } from "../worker/types";
import { paletteColors } from "./constants";
import { TileMapRenderer } from "./tile-map-renderer";

export class ScreenRenderer implements MessageHandler {
  private readonly canvas: OffscreenCanvas;
  private readonly ctx: OffscreenCanvasRenderingContext2D;
  private readonly tileMapRenderer: TileMapRenderer;

  constructor(memoryMap: MemoryMap) {
    this.canvas = new OffscreenCanvas(256, 256);
    this.ctx = assertNotNull(this.canvas.getContext("2d"));
    this.tileMapRenderer = new TileMapRenderer(memoryMap);
  }

  renderFrame() {
    const background = this.tileMapRenderer.getBackgroundPicture();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < background.length; y += 1) {
      for (let x = 0; x < background[y].length; x += 1) {
        this.ctx.fillStyle = paletteColors[background[y][x]];
        this.ctx.fillRect(x, y, 1, 1);
      }
    }

    postMessage({
      type: "graphics:frame-rendered",
      payload: this.canvas.transferToImageBitmap(),
    });
  }

  onMessage() {
    this.renderFrame();
  }
}
