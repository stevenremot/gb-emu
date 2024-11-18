import { MemoryMap } from "../memory/memory-map";
import { MessageHandler } from "../worker/types";
import { paletteColors } from "./constants";
import { LcdMemoryView } from "./lcd-memory-view";
import { TileMapRenderer } from "./tile-map-renderer";

const fps = 60;
const scanLinePerFrame = 154;
const timePerFrame = 1000 / fps;
const timePerScanLine = timePerFrame / scanLinePerFrame;

export class ScreenRenderer implements MessageHandler {
  private ctx: OffscreenCanvasRenderingContext2D | null = null;

  private readonly tileMapRenderer: TileMapRenderer;
  private readonly lcdMemoryView: LcdMemoryView;

  constructor(memoryMap: MemoryMap) {
    this.tileMapRenderer = new TileMapRenderer(memoryMap);
    this.lcdMemoryView = new LcdMemoryView(memoryMap.ioRegisters);
  }

  setCanvas(offscreenCanvas: OffscreenCanvas) {
    this.ctx = offscreenCanvas.getContext("2d");
  }

  /**
   * Creates a generator that takes the elapsed time in yield
   * parameter and draws as many lines as the time should allow
   */
  *renderFrame(): Generator<unknown, unknown, number> {
    let delay = 0;
    let currentLine = 0;
    while (true) {
      delay += yield;

      while (delay >= timePerFrame) {
        this.renderScanLine(currentLine);

        currentLine = (currentLine + 1) % scanLinePerFrame;
        delay -= timePerScanLine;
      }
    }
  }

  renderScanLine(line: number) {
    this.lcdMemoryView.LY = line;

    if (line >= 144 || !this.ctx) {
      return;
    }

    const backgroundLine = this.tileMapRenderer.getBackgroundLine(line);

    for (let x = 0; x < backgroundLine.length; x += 1) {
      this.ctx.fillStyle = paletteColors[backgroundLine[x]];
      this.ctx.fillRect(x, line, 1, 1);
    }
  }

  onMessage(message: string, payload: any) {
    switch (message) {
      case "setCanvas":
        this.setCanvas(payload);
        break;
      default:
        break;
    }
  }
}
