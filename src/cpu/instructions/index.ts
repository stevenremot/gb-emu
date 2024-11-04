import { logger } from "../../utils/logger";
import { InstructionBlock0 } from "./block-0";
import { InstructionBlock1 } from "./block-1";
import { InstructionBlock2 } from "./block-2";
import { InstructionBlock3 } from "./block-3";
import { InstructionBlockCB } from "./block-cb";
import { makeInstructionHandlerFromList } from "./handlers";
import { InstructionHandler } from "./types";

const instructions: InstructionHandler[] = [
  InstructionBlock0,
  InstructionBlock1,
  InstructionBlock2,
  InstructionBlockCB,
  InstructionBlock3,
];

const log = logger("executeInstruction");

export const executeInstruction = makeInstructionHandlerFromList(
  instructions,
  log,
);
