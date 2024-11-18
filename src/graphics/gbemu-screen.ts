import { GbemuApp } from "../gbemu-app";
import { assertNotNull } from "../utils/assertions";
import "./gbemu-screen.style.css";

export class GbemuScreen extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = /* HTML */ ` <canvas id="screen-canvas"></canvas> `;
  }

  connectedCallback() {
    const canvas = assertNotNull(
      this.querySelector("#screen-canvas"),
    ) as HTMLCanvasElement;
    canvas.width = 160;
    canvas.height = 144;
    const offscreenCanvas = canvas.transferControlToOffscreen();

    this.app.workerClient.callMethod(
      {
        target: "screenRenderer",
        method: "setCanvas",
        payload: offscreenCanvas,
      },
      [offscreenCanvas],
    );
  }

  get app() {
    return assertNotNull(document.querySelector("gbemu-app")) as GbemuApp;
  }
}

customElements.define("gbemu-screen", GbemuScreen);
