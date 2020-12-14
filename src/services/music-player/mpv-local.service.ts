import * as fs from 'fs-extra';
import { MusicPlayer } from './music-player.service';

export default class MPVLocalService implements MusicPlayer {
  // eslint-disable-next-line class-methods-use-this
  async play(file: string): Promise<void> {
    const data = await fs.readFile(file);
    const AudioContext = global.AudioContext || global.webkitAudioContext;

    const context = new AudioContext();

    return new Promise((resolve) => {
      context.decodeAudioData(MPVLocalService.toArrayBuffer(data), (buffer) => {
        const source = context.createBufferSource();
        source.start(0, 0);
        resolve();
      });
    });
  }

  private static toArrayBuffer(buffer: Buffer) {
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < buffer.length; i++) {
      view[i] = buffer[i];
    }
    return ab;
  }
}
