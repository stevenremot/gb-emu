import { ProcessorLoop } from "../cpu/processor-loop";
import { MemoryMap } from "../memory/memory-map";
import { logger } from "../utils/logger";
import { MessageHandler } from "./types";

type ResourceType = "boot" | "cartridge";

const loadLogger = logger("Loader");

export class Loader implements MessageHandler {
  private loadedFlags = {
    boot: false,
    cartridge: false,
  };

  constructor(
    private readonly processorLoop: ProcessorLoop,
    private readonly memoryMap: MemoryMap,
  ) {}

  onMessage(method: string, payload: any) {
    switch (method) {
      case "loadUrl":
        this.loadUrl(payload.type, payload.path);
    }
  }

  notifyLoaded(type: ResourceType) {
    this.loadedFlags[type] = true;

    if (this.loadedFlags.boot && this.loadedFlags.cartridge) {
      this.processorLoop.start();
    }
  }

  async loadUrl(type: ResourceType, path: string) {
    const response = await fetch(path);

    if (response.status !== 200) {
      loadLogger.error(`Could not load file ${path}:`, response);
      return;
    }

    const buffer = await response.arrayBuffer();

    if (type === "boot") {
      this.memoryMap.programMemoryRange.setBootRom(new Uint8Array(buffer));
    } else {
      this.memoryMap.programMemoryRange.setProgramRom(new Uint8Array(buffer));
    }

    this.notifyLoaded(type);
  }
}
