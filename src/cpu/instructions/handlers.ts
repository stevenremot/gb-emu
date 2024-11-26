import { Logger } from "../../utils/logger";
import { formatOpcode } from "../utils/opcode";
import { InstructionExecutionArgs, InstructionHandler } from "./types";

export function makeInstructionHandlerFromList(
  instructions: InstructionHandler[],
  logger: Logger,
) {
  const instructionByOpcode = new Map<number, InstructionHandler>();

  function findInstruction(opcode: number) {
    if (instructionByOpcode.has(opcode)) {
      return instructionByOpcode.get(opcode);
    }

    for (let index = 0; index < instructions.length; index += 1) {
      const instruction = instructions[index];

      if ((opcode & instruction.mask) === instruction.opcode) {
        instructionByOpcode.set(opcode, instruction);
        return instruction;
      }
    }

    return null;
  }

  return function instructionHandler(args: InstructionExecutionArgs) {
    const { opcode } = args;

    const instruction = findInstruction(opcode);

    if (instruction) {
      const result = instruction.execute(args);

      return {
        instruction: result.instruction ?? { opcode, name: instruction.name },
        executionTime: result.executionTime,
      };
    }

    logger.warn(`Unknown opcode ${formatOpcode(opcode)}`);
    return { instruction: { opcode }, executionTime: 1 };
  };
}
