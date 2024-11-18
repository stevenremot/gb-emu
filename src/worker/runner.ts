import { Processor } from "../cpu/processor";
import { ProcessorLoop } from "../cpu/processor-loop";
import { MessageHandler } from "./types";

export class Runner implements MessageHandler {
  constructor(
    private readonly processor: Processor,
    private readonly processorLoop: ProcessorLoop,
    private readonly screenRenderer: Generator<unknown, unknown, number>,
  ) {}

  toggle() {
    if (this.processorLoop.isRunning) {
      this.processorLoop.stop();
    } else {
      this.processorLoop.start();
    }
  }

  onMessage(message: string) {
    switch (message) {
      case "runOneInstruction":
        this.processor.runOneInstruction();
        this.screenRenderer.next(0.1);
        break;
      case "stop":
        this.processorLoop.stop();
        break;
      case "toggle":
        this.toggle();
        break;
      default:
        break;
    }
  }
}
