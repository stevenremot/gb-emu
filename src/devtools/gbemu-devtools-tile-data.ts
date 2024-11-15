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
      </div>
    `;
  }

  connectedCallback() {
    const canvas = this.querySelector(
      "#devtools-tile-canvas",
    ) as HTMLCanvasElement;

    const ctx = assertNotNull(canvas.getContext("bitmaprenderer"));

    this.querySelector("#devtools-tiles-refresh")?.addEventListener(
      "click",
      () => {
        this.app.workerClient.callMethod({
          target: "tileDebugger",
          method: "refreshTiles",
        });
      },
    );

    this.app.workerClient.addMessageListener(
      "debug:tiles-refreshed",
      (image) => {
        ctx.transferFromImageBitmap(image);
      },
    );
  }

  get app() {
    return assertNotNull(document.querySelector("gbemu-app")) as GbemuApp;
  }
}

customElements.define("gbemu-devtools-tile-data", GbemuDevtoolsTileData);
