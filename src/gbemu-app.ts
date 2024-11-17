import "./devtools/gbemu-devtools";
import "./gbemu-loader-static";
import { WorkerClient } from "./worker/worker-client";

export class GbemuApp extends HTMLElement {
  readonly workerClient = new WorkerClient();

  constructor() {
    super();

    this.workerClient.start();

    this.innerHTML = /* HTML */ `
      <gbemu-loader-static
        type="boot"
        path="/roms/boot/dmg_boot.gb"
      ></gbemu-loader-static>

      <gbemu-loader-static
        type="cartridge"
        path="/roms/tetris.gb"
      ></gbemu-loader-static>

      <gbemu-devtools></gbemu-devtools>
    `;
  }
}

customElements.define("gbemu-app", GbemuApp);
