import React from 'react';
import { PlaylistInfo, PlaylistVideo } from '../redux/playlist/types';
import {
  VideoDownloadResult,
  YoutubeService,
} from '../services/youtube.service';
import { PlaylistVideoBlock } from './PlaylistVideoBlock';

interface VideoListProps {
  playlistFolder: string;
  playlist: PlaylistInfo;
  youtubeService: YoutubeService;
  onVideoClick: (x: PlaylistVideo) => void;
  onDownloaded: (x: PlaylistInfo) => void;
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
      onDownloaded,
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

    onDownloaded({
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

  render() {
    const { playlist, onVideoClick, youtubeService } = this.props;
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
          <li key={v.id}>
            <PlaylistVideoBlock
              playlistVideo={v}
              youtubeService={youtubeService}
              onClick={() => onVideoClick(v)}
            />
          </li>
        );
      });

    return (
      <div>
        {downloadedVideos.length > 0 && (
          <div>
            <h2>Downloaded Videos</h2>
            <ul>{downloadedVideos}</ul>
          </div>
        )}
        {newVideos.length > 0 && (
          <div>
            <h2>Not Downloaded Videos</h2>
            <button
              type="button"
              onClick={() => this.downloadAll()}
              disabled={downloading}
            >
              Download All
            </button>
            <ul>{newVideos}</ul>
          </div>
        )}
      </div>
    );
  }
}
