import { MemoryMap } from "../memory/memory-map";
import { MessageHandler } from "../worker/types";
import { paletteColors, paletteColorsRgb } from "./constants";
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

  private readonly cachedLineData = new Uint8ClampedArray(4 * 160);

  constructor(memoryMap: MemoryMap) {
    this.tileMapRenderer = new TileMapRenderer(memoryMap);
    this.lcdMemoryView = new LcdMemoryView(memoryMap.ioRegisters);
  }

  setCanvas(offscreenCanvas: OffscreenCanvas) {
    this.ctx = offscreenCanvas.getContext("2d");
  }

  /**
   * Creates a step function that takes the elapsed time parameter and
   * draws as many lines as the time should allow
   */
  renderFrame() {
    let delay = 0;
    let currentLine = 0;

    return (stepDelay: number) => {
      delay += stepDelay;

      while (delay >= timePerFrame) {
        this.renderScanLine(currentLine);

        currentLine = (currentLine + 1) % scanLinePerFrame;
        delay -= timePerScanLine;
      }
    };
  }

  renderScanLine(line: number) {
    this.lcdMemoryView.LY = line;

    if (line >= 144 || !this.ctx) {
      return;
    }

    const backgroundLine = this.tileMapRenderer.getBackgroundLine(line);

    const lineData = this.cachedLineData;
    let currentDataIndex = 0;
    for (let x = 0; x < backgroundLine.length; x += 1) {
      const [r, g, b] = paletteColorsRgb[backgroundLine[x]];

      lineData[currentDataIndex + 0] = r;
      lineData[currentDataIndex + 1] = g;
      lineData[currentDataIndex + 2] = b;
      lineData[currentDataIndex + 3] = 255;
      currentDataIndex += 4;
    }
    this.ctx.putImageData(
      new ImageData(lineData, backgroundLine.length, 1),
      0,
      line,
    );
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
