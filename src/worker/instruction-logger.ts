import { InstructionResult } from "../cpu/instructions/types";
import { formatOpcode } from "../cpu/utils/opcode";
import { logger } from "../utils/logger";

export class InstructionLogger {
  private readonly logger = logger("DEBUG");

  private logs = Array.from<InstructionResult | undefined>({ length: 100 });
  private logIndex = 0;

  logResult(result: InstructionResult) {
    this.logs[this.logIndex] = result;
    this.logIndex = (this.logIndex + 1) % this.logs.length;
  }

  private *iterResults() {
    for (let i = this.logIndex; i < this.logs.length; i += 1) {
      yield this.logs[i];
    }

    for (let i = 0; i < this.logIndex; i += 1) {
      yield this.logs[i];
    }
  }

  flushLogs() {
    for (const result of this.iterResults()) {
      if (result) {
        this.flushResult(result);
      }
    }

    this.logs.fill(undefined);
    this.logIndex = 0;
  }

  private flushResult(result: InstructionResult) {
    this.logger.info(
      result.instruction
        ? `${result.instruction.name} (${formatOpcode(result.instruction.opcode)}) -`
        : "---",
      `execTime: ${result.executionTime}`,
    );
  }
}
