import { GbemuApp } from "./gbemu-app";
import { assertNotNull } from "./utils/assertions";
import { logger } from "./utils/logger";

export class GbemuLoaderStatic extends HTMLElement {
  #logger = logger("GbemuLoaderStatic");

  connectedCallback() {
    this.loadFile(String(this.getAttribute("path")));
  }

  async loadFile(path: string) {
    const response = await fetch(path);

    if (response.status !== 200) {
      this.#logger.error(`Could not load file ${path}:`, response);
      return;
    }

    const buffer = await response.arrayBuffer();
    this.app.memoryMap.loadProgram(new Uint8Array(buffer));
    this.app.processorLoop.start();
  }

  get app() {
    return assertNotNull(document.querySelector("gbemu-app") as GbemuApp);
  }
}

customElements.define("gbemu-loader-static", GbemuLoaderStatic);
