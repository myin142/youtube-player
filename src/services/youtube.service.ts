export interface YoutubeService {
  getPlaylistVideoInfos(playlist: string): Promise<VideoInfo[]>;
  downloadVideo(opt: VideoDownloadOptions): Promise<void>;
  stopAction(): boolean;
  getThumbnail(id: string): Promise<string>;
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
