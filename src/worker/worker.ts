import { Processor } from "../cpu/processor";
import { ProcessorLoop } from "../cpu/processor-loop";
import { MemoryMap } from "../memory/memory-map";
import { Loader } from "./loader";
import { InstructionLogger } from "./instruction-logger";
import { Runner } from "./runner";
import { debugRegisters } from "./debug/registers";
import { debugGraphicsBaseData } from "./debug/graphics";
import { TileDebugger } from "./debug/tile-debugger";
import { ScreenRenderer } from "../graphics/screen-renderer";

const memoryMap = new MemoryMap();
const processor = new Processor(memoryMap);
const processorLoop = new ProcessorLoop(processor);

const instructionLogger = new InstructionLogger();

const messageHandlers = {
  loader: new Loader(processorLoop, memoryMap),
  runner: new Runner(processor, processorLoop),
  tileDebugger: new TileDebugger(memoryMap),
  screenRenderer: new ScreenRenderer(memoryMap),
};

onmessage = (event) => {
  const { target, method, payload } = event.data;

  if (target in messageHandlers) {
    messageHandlers[target as keyof typeof messageHandlers].onMessage(
      method,
      payload,
    );
  }
};

processor.addObserver({
  afterInstruction(result) {
    instructionLogger.logResult(result);
    if (!result.instruction?.name) {
      postMessage({ type: "runner:unknown-instruction", payload: result });
    }
  },
});

processorLoop.addObserver({
  onStarted() {
    postMessage({ type: "runner:loop-started" });
  },
  onStopped() {
    postMessage({ type: "runner:loop-stopped" });
    debugRegisters(processor.registers);
    debugGraphicsBaseData(memoryMap);
    instructionLogger.flushLogs();
  },
});

Object.assign(globalThis, { memoryMap });
