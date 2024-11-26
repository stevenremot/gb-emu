import { VideoRam } from "../memory/video-ram";

export class TileDataView {
  private readonly cachedTileData = new Uint8Array(64);
  constructor(private readonly videoRam: VideoRam) {}

  getTile(blockId: number, addressMode: number) {
    let firstAddress = 0x8000 + blockId * 16;

    if (addressMode === 0 && blockId < 128) {
      firstAddress += 256 * 16;
    }

    const tileData = this.cachedTileData;

    for (let line = 0; line < 8; line += 1) {
      const address = firstAddress + line * 2;
      const lsb = this.videoRam.readAt(address);
      const msb = this.videoRam.readAt(address + 1);

      for (let column = 0; column < 8; column += 1) {
        const offset = 7 - column;
        const mask = 1 << offset;
        tileData[line * 8 + column] =
          ((lsb & mask) | ((msb & mask) << 1)) >> offset;
      }
    }

    return tileData;
  }
}
