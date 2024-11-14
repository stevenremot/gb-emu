import { GbemuApp } from "./gbemu-app";
import { assertNotNull } from "./utils/assertions";

export class GbemuLoaderStatic extends HTMLElement {
  connectedCallback() {
    this.loadFile(String(this.getAttribute("path")));
  }

  async loadFile(path: string) {
    const type = this.getAttribute("type");
    if (type !== "boot" && type !== "cartridge") {
      throw new Error(`Wrong loaded type: ${type}`);
    }

    this.app.workerClient.loadUrl(type, path);
  }

  get app() {
    return assertNotNull(document.querySelector("gbemu-app") as GbemuApp);
  }
}

customElements.define("gbemu-loader-static", GbemuLoaderStatic);
