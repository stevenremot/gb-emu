import { LcdMemoryView } from "../../graphics/lcd-memory-view";
import { MemoryMap } from "../../memory/memory-map";

export function debugGraphicsBaseData(memoryMap: MemoryMap) {
  const view = new LcdMemoryView(memoryMap.ioRegisters);
  const lcdControlFlags = view.controlFlags;
  const lcdStatusFlags = view.statusFlags;

  const graphicsBaseData = {
    lcdControl: {
      lcdEnable: lcdControlFlags.lcdEnable,
      windowTileMap: lcdControlFlags.windowTileMap,
      windowEnable: lcdControlFlags.windowEnable,
      bgWindowAddressingMode: lcdControlFlags.bgWindowAddressingMode,
      bgTileMap: lcdControlFlags.bgTileMap,
      objSize: lcdControlFlags.objSize,
      objEnable: lcdControlFlags.objEnable,
      bgWindowEnable: lcdControlFlags.bgWindowEnable,
    },
    lcdStatus: {
      lycIntSelect: lcdStatusFlags.lycIntSelect,
      mode2IntSelect: lcdStatusFlags.mode2IntSelect,
      mode1IntSelect: lcdStatusFlags.mode1IntSelect,
      mode0IntSelect: lcdStatusFlags.mode0IntSelect,
      lycEqualsLy: lcdStatusFlags.lycEqualsLy,
      ppuMode: lcdStatusFlags.ppuMode,
    },
    SCY: view.SCY,
    SCX: view.SCX,
    LY: view.LY,
    LYC: view.LYC,
    backgroundPalette: view.backgroundPalette,
  };

  postMessage({
    type: "debug:graphics-base-data-changed",
    payload: graphicsBaseData,
  });
}
