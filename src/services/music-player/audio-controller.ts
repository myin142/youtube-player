import { EventEmitter } from 'events';
import fs from 'fs';
import { clamp } from 'lodash';

export class AudioController extends EventEmitter {
  private songStartingTime: number | null = null;

  private buffer: AudioBuffer | null = null;

  private source: AudioBufferSourceNode | null = null;

  // eslint-disable-next-line react/static-property-placement
  private context: AudioContext;

  private gainNode: GainNode | null = null;

  constructor() {
    super();
    const AudioContext = global.AudioContext || global.webkitAudioContext;
    this.context = new AudioContext();
  }

  get isPlaying(): boolean {
    return this.context.state === 'running';
  }

  get volume(): number {
    let normalizedValue = this.gainNode?.gain.value;
    if (normalizedValue == null) {
      normalizedValue = 1;
    }
    return normalizedValue;
  }

  set volume(volume: number) {
    if (this.gainNode) {
      // Prevent volume to get too loud
      this.gainNode.gain.value = clamp(volume, 0, 1);
    }
  }

  get songDuration(): number {
    return this.buffer?.duration || 0;
  }

  get playbackTime(): number {
    if (this.songStartingTime !== null) {
      return this.context.currentTime - this.songStartingTime;
    }
    return 0;
  }

  play(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(file, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        this.context.decodeAudioData(this.toArrayBuffer(data), (buffer) => {
          this.playFromBuffer(buffer);
          resolve();
        });
      });
    });
  }

  private toArrayBuffer(buffer: Buffer) {
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; i++) {
      view[i] = buffer[i];
    }
    return ab;
  }

  private playFromBuffer(buffer: AudioBuffer) {
    this.stop(false);
    this.resume();
    this.buffer = buffer;
    this.initSource();
    this.songStartingTime = this.context.currentTime;
    this.source?.start(0, 0);
  }

  private stop(report = true) {
    if (this.source) {
      if (!report) {
        this.source.onended = null;
      }
      this.source.stop(0);
      this.gainNode = null;
    }
  }

  private initSource() {
    this.source = this.context.createBufferSource();
    this.gainNode = this.context.createGain();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
    this.source.onended = () => this.onSongFinished();
  }

  private onSongFinished() {
    this.emit('songFinished');
  }

  // seek(playbackTime: number) {
  //   if (this.isPlaying) {
  //     // this.stop(false);
  //     // this.initSource();
  //     // this.songStartingTime = this.context.currentTime - playbackTime;
  //     // this.playbackTime = playbackTime;
  //     // this.source.start(0, this.playbackTime);
  //     this.pause();
  //     // this.songStartingTime = this.context.currentTime - playbackTime;
  //   }
  //   this.source?.start(playbackTime);
  // }

  pause() {
    this.context.suspend();
  }

  resume() {
    this.context.resume();
  }

  mute(): void {
    if (this.gainNode) {
      this.gainNode.gain.value = 0;
    }
  }
}

export const audioController = new AudioController();
