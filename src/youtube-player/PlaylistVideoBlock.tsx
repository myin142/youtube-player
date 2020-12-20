import React, { MouseEventHandler } from 'react';
import { PlaylistVideo } from '../redux/playlist/types';
import { YoutubeService } from '../services/youtube.service';

export interface PlaylistVideoBlockProps {
  youtubeService: YoutubeService;
  playlistVideo: PlaylistVideo;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export function PlaylistVideoBlock({
  playlistVideo,
  youtubeService,
  onClick,
  disabled,
}: PlaylistVideoBlockProps) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}>
      <img
        src={youtubeService.getThumbnail(playlistVideo.id)}
        width="64px"
        alt={playlistVideo.title}
      />
      {playlistVideo.title}
    </button>
  );
}
