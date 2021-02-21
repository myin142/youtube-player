import { IconButton, Tooltip, Typography } from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import React from 'react';
import { PlaylistInfo, PlaylistVideo } from '../types';
import {
  VideoDownloadResult,
  YoutubeService,
} from '../../services/youtube.service';
import { PlaylistVideoBlock } from './PlaylistVideoBlock';

interface VideoListProps {
  playlistFolder: string;
  playlist: PlaylistInfo;
  youtubeService: YoutubeService;
  onVideoClick: (x: PlaylistVideo) => void;
  onPlaylistUpdate: (x: PlaylistInfo) => void;
  onVideoUpdate: (x: PlaylistVideo) => void;
  editMode: boolean;
}

interface VideoListState {
  downloading: boolean;
}

export default class PlaylistVideos extends React.Component<
  VideoListProps,
  VideoListState
> {
  constructor(props: VideoListProps) {
    super(props);
    this.state = {
      downloading: false,
    };
  }

  async download(ids: string[]) {
    const { downloading } = this.state;
    const {
      onPlaylistUpdate,
      youtubeService,
      playlistFolder,
      playlist,
    } = this.props;
    if (downloading) {
      console.log('Already downloading something');
      return;
    }

    this.setState({ downloading: true });
    const result: VideoDownloadResult[] = await Promise.all(
      ids
        .map(async (id) => {
          return youtubeService.downloadVideo({
            id,
            location: playlistFolder,
          });
        })
        .filter((x) => !!x)
        .map((x) => x as Promise<VideoDownloadResult>)
    );

    const failedDownload = ids.filter(
      (id) => result.findIndex((r) => r.id === id) === -1
    );
    if (failedDownload.length > 0) {
      console.log('Failed to download', failedDownload);
    }

    const updatedVideos: PlaylistVideo[] = playlist.videos.map((v) => {
      const videoResult = result.find((r) => r.id === v.id);
      if (videoResult) {
        return {
          ...v,
          fileName: `${playlistFolder}/${videoResult.name}`,
        };
      }
      return v;
    });

    onPlaylistUpdate({
      ...playlist,
      videos: updatedVideos,
    });

    this.setState({ downloading: false });
  }

  private downloadAll() {
    const { playlist } = this.props;
    const ids = playlist.videos.map((v) => v.id);
    this.download(ids);
  }

  private toggleAllVideos() {
    const { playlist, onPlaylistUpdate } = this.props;
    const disabled = playlist.videos.every((v) => !v.disabled);

    playlist.videos.forEach((v) => {
      v.disabled = disabled;
    });

    onPlaylistUpdate(playlist);
  }

  private onVideoClicked(video: PlaylistVideo) {
    const { editMode, onVideoClick, onVideoUpdate } = this.props;
    if (editMode) {
      video.disabled = !video.disabled;
      onVideoUpdate(video);
    } else {
      onVideoClick(video);
    }
  }

  render() {
    const { playlist, youtubeService, editMode } = this.props;
    const { downloading } = this.state;

    const newVideos = playlist.videos
      .filter((v) => !v.fileName)
      .map((v) => {
        return (
          <li key={v.id}>
            <PlaylistVideoBlock
              playlistVideo={v}
              youtubeService={youtubeService}
              onClick={() => this.download([v.id])}
              disabled={downloading}
            />
          </li>
        );
      });

    const downloadedVideos = playlist.videos
      .filter((v) => !!v.fileName)
      .map((v) => {
        return (
          <li key={v.id} className="flex-horizontal">
            <PlaylistVideoBlock
              playlistVideo={v}
              youtubeService={youtubeService}
              disabled={v.disabled}
              editing={editMode}
              onClick={() => this.onVideoClicked(v)}
            />
          </li>
        );
      });

    const enabled = playlist.videos.every((v) => !v.disabled);

    return (
      <>
        {downloadedVideos.length > 0 && (
          <div>
            {editMode && (
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => this.toggleAllVideos()}
              />
            )}
            <ul>{downloadedVideos}</ul>
          </div>
        )}
        {newVideos.length > 0 && (
          <div>
            <Typography variant="h5">Not Downloaded Videos</Typography>
            <Tooltip title="Download all">
              <IconButton
                onClick={() => this.downloadAll()}
                disabled={downloading}
              >
                <GetApp />
              </IconButton>
            </Tooltip>
            <ul>{newVideos}</ul>
          </div>
        )}
      </>
    );
  }
}
