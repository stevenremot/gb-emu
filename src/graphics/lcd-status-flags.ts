export class LcdStatusFlags {
  public readonly lycIntSelect: number;
  public readonly mode2IntSelect: number;
  public readonly mode1IntSelect: number;
  public readonly mode0IntSelect: number;
  public readonly lycEqualsLy: number;
  public readonly ppuMode: number;

  constructor(lcdStatusByte: number) {
    this.lycIntSelect = 0x01000000 & lcdStatusByte ? 1 : 0;
    this.mode2IntSelect = 0x00100000 & lcdStatusByte ? 1 : 0;
    this.mode1IntSelect = 0x00010000 & lcdStatusByte ? 1 : 0;
    this.mode0IntSelect = 0x00001000 & lcdStatusByte ? 1 : 0;
    this.lycEqualsLy = 0x00000100 & lcdStatusByte ? 1 : 0;
    this.ppuMode = 0x0000011 & lcdStatusByte;
  }
}
