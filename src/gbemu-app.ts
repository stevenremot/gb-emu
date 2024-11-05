import { Processor } from "./cpu/processor";
import { MemoryMap } from "./memory/memory-map";

import "./devtools/gbemu-devtools";
import "./gbemu-loader-static";
import { ProcessorLoop } from "./cpu/processor-loop";

export class GbemuApp extends HTMLElement {
  readonly memoryMap: MemoryMap;
  readonly processor: Processor;
  readonly processorLoop: ProcessorLoop;

  constructor() {
    super();

    this.memoryMap = new MemoryMap();
    this.processor = new Processor(this.memoryMap);
    this.processorLoop = new ProcessorLoop(this.processor);

    this.innerHTML = /* HTML */ `
      <gbemu-loader-static path="/roms/dmg_boot.bin"></gbemu-loader-static
      ><gbemu-devtools></gbemu-devtools>
    `;
  }
}

customElements.define("gbemu-app", GbemuApp);
