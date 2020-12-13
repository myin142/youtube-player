export interface YoutubeService {
  getPlaylistVideoInfos(playlist: string): Promise<VideoInfo[]>;
  downloadVideo(opt: VideoDownloadOptions): Promise<string[]>;
  stopAction(): boolean;
  getThumbnail(id: string): string;
}

export interface VideoInfo {
  id: string;
  title: string;
}

export interface VideoDownloadOptions {
  id: string;
  location: string;
  format: VideoFormat;
}

export enum VideoFormat {
  AUDIO,
  VIDEO,
}

export interface VideoDownloadResult {
  id: string;
  name: string;
}

// TODO: find better place
export enum Status {
  NONE,
  SEARCHING,
  DOWNLOADING,
}
