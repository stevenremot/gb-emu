import { GbemuApp } from "../gbemu-app";
import { assertNotNull } from "../utils/assertions";

import "./gbemu-devtools-tile-data.style.css";

export class GbemuDevtoolsTileData extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = /* HTML */ `
      <div class="section">
        <div class="section-title">Tiles</div>

        <button id="devtools-tiles-refresh">Refresh</button>

        <div class="canvas-wrapper">
          <canvas id="devtools-tile-canvas"></canvas>
        </div>

        <button id="devtools-screen-refresh">Screen Refresh</button>

        <div class="canvas-wrapper">
          <canvas id="devtools-screen-canvas"></canvas>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    const canvas = this.querySelector(
      "#devtools-tile-canvas",
    ) as HTMLCanvasElement;

    const ctx = assertNotNull(canvas.getContext("bitmaprenderer"));

    const canvas2 = this.querySelector(
      "#devtools-screen-canvas",
    ) as HTMLCanvasElement;

    const ctx2 = assertNotNull(canvas2.getContext("bitmaprenderer"));

    this.querySelector("#devtools-tiles-refresh")?.addEventListener(
      "click",
      () => {
        this.app.workerClient.callMethod({
          target: "tileDebugger",
          method: "refreshTiles",
        });
      },
    );

    this.querySelector("#devtools-screen-refresh")?.addEventListener(
      "click",
      () => {
        this.app.workerClient.callMethod({
          target: "screenRenderer",
          method: "refresh",
        });
      },
    );

    this.app.workerClient.addMessageListener(
      "debug:tiles-refreshed",
      (image) => {
        ctx.transferFromImageBitmap(image);
      },
    );

    this.app.workerClient.addMessageListener(
      "graphics:frame-rendered",
      (image) => {
        ctx2.transferFromImageBitmap(image);
      },
    );
  }

  get app() {
    return assertNotNull(document.querySelector("gbemu-app")) as GbemuApp;
  }
}

customElements.define("gbemu-devtools-tile-data", GbemuDevtoolsTileData);
