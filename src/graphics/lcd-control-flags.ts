export class LcdControlFlags {
  public readonly lcdEnable: number;
  public readonly windowTileMap: number;
  public readonly windowEnable: number;
  public readonly bgWindowAddressingMode: number;
  public readonly bgTileMap: number;
  public readonly objSize: number;
  public readonly objEnable: number;
  public readonly bgWindowEnable: number;

  constructor(lcdControlByte: number) {
    this.lcdEnable = 0b1000000 & lcdControlByte ? 1 : 0;
    this.windowTileMap = 0b0100000 & lcdControlByte ? 1 : 0;
    this.windowEnable = 0b0010000 & lcdControlByte ? 1 : 0;
    this.bgWindowAddressingMode = 0b00010000 & lcdControlByte ? 1 : 0;
    this.bgTileMap = 0b00001000 & lcdControlByte ? 1 : 0;
    this.objSize = 0b00000100 & lcdControlByte ? 1 : 0;
    this.objEnable = 0b00000010 & lcdControlByte ? 1 : 0;
    this.bgWindowEnable = 0b00000001 & lcdControlByte ? 1 : 0;
  }
}
