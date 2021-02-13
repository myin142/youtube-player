import React, { ChangeEvent } from 'react';
import { connect } from 'react-redux';
import { videoActions, VideoActionType } from '../redux/actions';
import { PlaylistInfo, PlaylistVideo } from '../redux/types';
import {
  VideoDownloadResult,
  YoutubeService,
} from '../services/youtube.service';
import { PlaylistVideoBlock } from './PlaylistVideoBlock';

type VideoListProps = VideoActionType & {
  playlistFolder: string;
  playlist: PlaylistInfo;
  youtubeService: YoutubeService;
  onPlaylistUpdate: (x: PlaylistInfo) => void;
  onVideoUpdate: (x: PlaylistVideo) => void;
};

interface VideoListState {
  downloading: boolean;
}

class PlaylistVideos extends React.Component<VideoListProps, VideoListState> {
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

  private toggleVideo(
    { target }: ChangeEvent<HTMLInputElement>,
    video: PlaylistVideo
  ) {
    const { onVideoUpdate } = this.props;
    video.disabled = !target.checked;
    onVideoUpdate(video);
  }

  private toggleAllVideos() {
    const { playlist, onPlaylistUpdate } = this.props;
    const disabled = playlist.videos.every((v) => !v.disabled);

    playlist.videos.forEach((v) => {
      v.disabled = disabled;
    });

    onPlaylistUpdate(playlist);
  }

  render() {
    const { playlist, playVideo, youtubeService } = this.props;
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
            <input
              type="checkbox"
              checked={!v.disabled}
              onChange={(e) => this.toggleVideo(e, v)}
            />
            <PlaylistVideoBlock
              playlistVideo={v}
              youtubeService={youtubeService}
              disabled={v.disabled}
              onClick={() => playVideo(v)}
            />
          </li>
        );
      });

    const enabled = playlist.videos.every((v) => !v.disabled);

    return (
      <div>
        {downloadedVideos.length > 0 && (
          <div>
            <h2>Downloaded Videos</h2>
            <input
              type="checkbox"
              checked={enabled}
              onChange={() => this.toggleAllVideos()}
            />
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

export default connect(null, videoActions)(PlaylistVideos);
