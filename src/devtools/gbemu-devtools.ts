import { InstructionResult } from "../cpu/instructions/types";
import { Processor } from "../cpu/processor";
import { formatOpcode } from "../cpu/utils/opcode";
import { GbemuApp } from "../gbemu-app";
import { assertNotNull } from "../utils/assertions";
import { logger } from "../utils/logger";

import "./gbemu-devtools-registers";
import "./gbemu-devtools.style.css";

export class GbemuDevtools extends HTMLElement {
  processor?: Processor;
  #logger = logger("DEBUG");

  constructor() {
    super();

    this.innerHTML = /* HTML */ `
      <div class="actions">
        <button type="button" id="play-pause">⏸️</button>
        <button type="button" id="run-one">Run one</button>
      </div>
      <gbemu-devtools-registers></gbemu-devtools-registers>
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
