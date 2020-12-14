export interface MusicPlayer {
  play(file: string): Promise<void>;
  pause(): void;
  resume(): void;
}
