import { Processor } from "../cpu/processor";
import { GbemuApp } from "../gbemu-app";
import { assertNotNull } from "../utils/assertions";

import "./gbemu-devtools-registers";
import "./gbemu-devtools-graphics-base-data";
import "./gbemu-devtools.style.css";
import "./gbemu-devtools-tile-data";

export class GbemuDevtools extends HTMLElement {
  processor?: Processor;

  constructor() {
    super();

    this.innerHTML = /* HTML */ `
      <div class="actions">
        <button type="button" id="play-pause">⏸️</button>
        <button type="button" id="run-one">Run one</button>
      </div>
      <gbemu-devtools-registers></gbemu-devtools-registers>
      <gbemu-devtools-graphics-base-data></gbemu-devtools-graphics-base-data>
      <gbemu-devtools-tile-data></gbemu-devtools-tile-data>
    `;
  }

  connectedCallback() {
    this.querySelector("#run-one")?.addEventListener("click", () => {
      this.app.workerClient.runOneInstruction();
      this.pause();
    });

    const playPauseButton = assertNotNull(this.querySelector("#play-pause"));
    playPauseButton.addEventListener("click", () => {
      this.app.workerClient.toggleLoop();
    });

    this.app.workerClient.addMessageListener("runner:loop-started", () => {
      playPauseButton.textContent = "⏸️";
    });

    this.app.workerClient.addMessageListener("runner:loop-stopped", () => {
      playPauseButton.textContent = "▶️";
    });

    this.app.workerClient.addMessageListener(
      "runner:unknown-instruction",
      (result) => {
        if (!result.instruction?.name) {
          this.pause();
        }
      },
    );
  }

  pause() {
    this.app.workerClient.stop();
    document.body.dispatchEvent(new CustomEvent("gbemu:execution-paused"));
  }

  get app() {
    return assertNotNull(document.querySelector("gbemu-app")) as GbemuApp;
  }
}

customElements.define("gbemu-devtools", GbemuDevtools);
