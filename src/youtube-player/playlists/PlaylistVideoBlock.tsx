import React, { MouseEventHandler } from 'react';
import { PlaylistVideo } from '../../redux/playlist/types';
import { YoutubeService } from '../../services/youtube.service';

export interface PlaylistVideoBlockProps {
  youtubeService: YoutubeService;
  playlistVideo: PlaylistVideo;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  editing?: boolean;
}

export function PlaylistVideoBlock({
  playlistVideo,
  youtubeService,
  onClick,
  disabled,
  editing,
}: PlaylistVideoBlockProps) {
  let classes = 'btn-1 flex-horizontal video-block';
  if (disabled && editing) {
    classes += ' disabled';
  }

  return (
    <button
      className={classes}
      type="button"
      onClick={onClick}
      disabled={disabled && !editing}
    >
      <img
        src={youtubeService.getThumbnail(playlistVideo.id)}
        className="thumbnail"
        alt={playlistVideo.title}
      />
      <div>{playlistVideo.title}</div>
    </button>
  );
}
