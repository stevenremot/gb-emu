import { Logger } from "../../utils/logger";
import { formatOpcode } from "../utils/opcode";
import { InstructionExecutionArgs, InstructionHandler } from "./types";

export function makeInstructionHandlerFromList(
  instructions: InstructionHandler[],
  logger: Logger,
) {
  return (args: InstructionExecutionArgs) => {
    const { opcode } = args;

    for (let instruction of instructions) {
      if ((opcode & instruction.mask) === instruction.opcode) {
        return {
          instruction: { opcode, name: instruction.name },
          ...instruction.execute(args),
        };
      }
    }

    logger.warn(`Unknown opcode ${formatOpcode(opcode)}`);
    return { instruction: { opcode }, executionTime: 1 };
  };
}
