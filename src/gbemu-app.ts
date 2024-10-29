import { Processor } from "./cpu/processor";
import { MemoryMap } from "./memory/memory-map";

import "./devtools/gbemu-devtools";
import "./gbemu-loader-static";

export class GbemuApp extends HTMLElement {
  memoryMap: MemoryMap;
  processor: Processor;

  constructor() {
    super();

    this.memoryMap = new MemoryMap();
    this.processor = new Processor(this.memoryMap);

    this.innerHTML = /* HTML */ `
      <gbemu-loader-static
        path="/roms/mts/acceptance/boot_regs-dmg0.gb"
      ></gbemu-loader-static
      ><gbemu-devtools></gbemu-devtools>
    `;
  }
}

customElements.define("gbemu-app", GbemuApp);
