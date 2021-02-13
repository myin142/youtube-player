export interface PlaylistFolderInfo {
  playlist: PlaylistInfo;
  fullPath: string;
  name: string;
}

export interface PlaylistInfo {
  playlistId: string;
  title: string;
  videos: PlaylistVideo[];
}

export interface PlaylistVideo {
  id: string;
  title: string;
  fileName?: string;
  disabled?: boolean;
}

export interface YoutubePlayerState {
  playingPlaylist?: PlaylistFolderInfo;
  playingVideo?: PlaylistVideo;
  videoChanged?: boolean;
}
