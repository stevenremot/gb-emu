import { Processor } from "../cpu/processor";
import { ProcessorLoop } from "../cpu/processor-loop";
import { MemoryMap } from "../memory/memory-map";
import { Loader } from "./loader";
import { InstructionLogger } from "./instruction-logger";
import { Runner } from "./runner";

const memoryMap = new MemoryMap();
const processor = new Processor(memoryMap);
const processorLoop = new ProcessorLoop(processor);

const instructionLogger = new InstructionLogger();

const messageHandlers = {
  loader: new Loader(processorLoop, memoryMap),
  runner: new Runner(processor, processorLoop),
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

    const registers = {
      PC: processor.registers.PC,
      SP: processor.registers.SP,
      "16bits": [] as number[],
      "8bits": [] as number[],
    };

    for (let i = 0; i < 4; i += 1) {
      registers["16bits"].push(processor.registers.get16Bits(i));
    }

    for (let i = 0; i < 8; i += 1) {
      registers["8bits"].push(processor.registers.get8Bits(i));
    }

    postMessage({ type: "debug:registers-changed", payload: registers });
    instructionLogger.flushLogs();
  },
});
