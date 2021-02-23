import {
  Checkbox,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import React from 'react';
import { PlaylistFolderInfo, PlaylistVideo } from '../types';
import {
  VideoDownloadResult,
  YoutubeService,
} from '../../services/youtube.service';
import { PlaylistVideoBlock } from './PlaylistVideoBlock';
import FlexBox from '../../components/FlexBox';
import InputField from '../../components/InputField';

interface VideoListProps {
  playlist: PlaylistFolderInfo;
  youtubeService: YoutubeService;
  onVideoClick: (x: PlaylistVideo) => void;
  onPlaylistUpdate: (x: PlaylistFolderInfo) => void;
  onPlaylistIdChange: (id: string) => void;
  onVideoUpdate: (x: PlaylistVideo) => void;
  editPlaylist: PlaylistFolderInfo | null;
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
    const { onPlaylistUpdate, youtubeService, playlist } = this.props;
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
            location: playlist.fullPath,
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

    const updatedVideos: PlaylistVideo[] = playlist.playlist.videos.map((v) => {
      const videoResult = result.find((r) => r.id === v.id);
      if (videoResult) {
        return {
          ...v,
          fileName: `${playlist.fullPath}/${videoResult.name}`,
        };
      }
      return v;
    });

    onPlaylistUpdate({
      ...playlist,
      playlist: {
        ...playlist.playlist,
        videos: updatedVideos,
      },
    });

    this.setState({ downloading: false });
  }

  private downloadAll() {
    const { playlist } = this.props;
    const ids = playlist.playlist.videos.map((v) => v.id);
    this.download(ids);
  }

  private toggleAllVideos() {
    const { playlist, onPlaylistUpdate } = this.props;
    const disabled = playlist.playlist.videos.every((v) => !v.disabled);

    playlist.playlist.videos.forEach((v) => {
      v.disabled = disabled;
    });

    onPlaylistUpdate(playlist);
  }

  private onVideoClicked(video: PlaylistVideo) {
    const { editPlaylist, onVideoClick, onVideoUpdate } = this.props;
    if (editPlaylist) {
      video.disabled = !video.disabled;
      onVideoUpdate(video);
    } else {
      onVideoClick(video);
    }
  }

  private onPlaylistIdChange({
    target,
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    this.props.onPlaylistIdChange(target.value);
  }

  render() {
    const { playlist, youtubeService, editPlaylist } = this.props;
    const { downloading } = this.state;
    const editMode = !!editPlaylist;

    const newVideos = playlist.playlist.videos
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

    const downloadedVideos = playlist.playlist.videos
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

    const enabled = playlist.playlist.videos.every((v) => !v.disabled);

    return (
      <>
        <div className="flex-vertical gap">
          {editPlaylist && (
            <FlexBox style={{ justifyContent: 'flex-start' }}>
              <Checkbox
                checked={enabled}
                onChange={() => this.toggleAllVideos()}
              />
              <InputField
                placeholder="Playlist Id"
                value={editPlaylist.playlist.playlistId}
                onChange={(e) => this.onPlaylistIdChange(e)}
              />
            </FlexBox>
          )}
          {downloadedVideos.length > 0 && <ul>{downloadedVideos}</ul>}
        </div>
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
