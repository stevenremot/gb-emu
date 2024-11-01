import { Processor } from "./processor";

const cpuFrequency = 4194304;
const cycleTime = 1000 / cpuFrequency;
const maxDelay = 1000;

export type ProcessorLoopObserver = {
  onStarted?(): void;
  onStopped?(): void;
};

export class ProcessorLoop {
  private currentDelay = 0;
  private lastTimestamp = -1;
  #isRunning = false;
  private readonly observers: ProcessorLoopObserver[] = [];

  constructor(private readonly processor: Processor) {}

  start() {
    this.#isRunning = true;

    const loop = (timestamp: number) => {
      if (!this.#isRunning) {
        return;
      }

      if (this.lastTimestamp < 0) {
        this.lastTimestamp = timestamp;
      }

      let delay = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;

      // In case the tab has been unfocused and refocused, skip
      // the current step
      if (delay > maxDelay) {
        delay = 0;
      }

      this.currentDelay += delay;

      while (this.currentDelay >= cycleTime && this.#isRunning) {
        const { executionTime } = this.processor.runOneInstruction();
        this.currentDelay -= executionTime * cycleTime;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    for (const observer of this.observers) {
      observer.onStarted?.();
    }
  }

  stop() {
    this.#isRunning = false;
    this.lastTimestamp = -1;

    for (const observer of this.observers) {
      observer.onStopped?.();
    }
  }

  addObserver(observer: ProcessorLoopObserver) {
    this.observers.push(observer);
  }

  get isRunning() {
    return this.#isRunning;
  }
}
