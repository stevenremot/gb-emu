import { Logger } from "../../utils/logger";
import { formatOpcode } from "../utils/opcode";
import { nullInstructionEffect } from "./instruction-effect";
import { InstructionHandler } from "./types";

export function makeInstructionHandlerFromList(
  instructions: InstructionHandler[],
  logger: Logger,
) {
  return (opcode: number) => {
    for (let instruction of instructions) {
      if ((opcode & instruction.mask) === instruction.opcode) {
        const effect = instruction.execute(opcode);

        if (!effect.instruction) {
          effect.setInstruction({ opcode, name: instruction.name });
        }

        return effect;
      }
    }

    logger.warn(`Unknown opcode ${formatOpcode(opcode)}`);
    return nullInstructionEffect().setInstruction({ opcode });
  };
}
