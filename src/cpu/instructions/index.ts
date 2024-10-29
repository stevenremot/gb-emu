import { logger } from "../../utils/logger";
import { InstructionBlock0 } from "./block-0";
import { InstructionBlock3 } from "./block-3";
import { makeInstructionHandlerFromList } from "./handlers";
import { InstructionHandler } from "./types";

const instructions: InstructionHandler[] = [
  InstructionBlock0,
  InstructionBlock3,
];

const log = logger("executeInstruction");

export const executeInstruction = makeInstructionHandlerFromList(
  instructions,
  log,
);
