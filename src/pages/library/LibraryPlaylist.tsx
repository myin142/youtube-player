import React from 'react';
import {
  LibraryFolderInfo,
  LibraryPlaylistVideo,
} from '../../services/library.service';
import AudioController from '../../services/music-player/audio-controller';
import { MusicPlayer } from '../../services/music-player/music-player.service';
import {
  VideoDownloadResult,
  VideoInfo,
  YoutubeService,
} from '../../services/youtube.service';
import LibraryPlaylistCreate from './LibraryPlaylistCreate';
import LibraryPlaylistInfoComponent from './LibraryPlaylistInfoComponent';

interface LibraryPlaylistProps {
  musicPlayer: MusicPlayer;
  youtubeService: YoutubeService;
  folderInfo: LibraryFolderInfo;
  videoInfos: VideoInfo[];
  onFolderInfoChange: (info: LibraryFolderInfo) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LibraryPlaylistState {
  isPlaying: boolean;
}

export default class LibraryPlaylist extends React.Component<
  LibraryPlaylistProps,
  LibraryPlaylistState
> {
  constructor(props: LibraryPlaylistProps) {
    super(props);
    this.state = {
      isPlaying: false,
    };
  }

  private createPlaylist(id: string): void {
    const { folderInfo, onFolderInfoChange } = this.props;
    const newInfo: LibraryFolderInfo = {
      ...folderInfo,
      playlistInfo: {
        playlistId: id,
        videos: [],
      },
    };

    onFolderInfoChange(newInfo);
  }

  private downloadedVideos(result: VideoDownloadResult[]): void {
    const { folderInfo, onFolderInfoChange, youtubeService } = this.props;
    const newVideoInfos: LibraryPlaylistVideo[] = result.map((x) => {
      return {
        id: x.id,
        name: x.name,
        thumbnail: youtubeService.getThumbnail(x.id),
      };
    });
    const videos = folderInfo.playlistInfo.videos || [];
    videos.push(...newVideoInfos);

    const updatedInfo: LibraryFolderInfo = {
      ...folderInfo,
      playlistInfo: {
        ...folderInfo.playlistInfo,
        videos,
      },
    };

    onFolderInfoChange(updatedInfo);
  }

  private playPlaylist() {
    const { folderInfo, musicPlayer } = this.props;
    const { isPlaying } = this.state;
    const { videos } = folderInfo.playlistInfo;

    // TODO: make generic
    const ctrl = musicPlayer as AudioController;

    let previousIdx = -1;
    const randomVideoIdx = () => Math.floor(Math.random() * videos.length);
    const playRandom = () => {
      let idx = previousIdx;
      while (idx === previousIdx) {
        idx = randomVideoIdx();
      }

      previousIdx = idx;
      console.log(idx);

      musicPlayer.play(`${folderInfo.fullPath}/${videos[idx].name}`);
    };
    const playRandomThis = playRandom.bind(this);

    ctrl.removeAllListeners('songFinished');
    ctrl.addListener('songFinished', playRandomThis);

    playRandom();
  }

  render() {
    const { folderInfo, videoInfos, youtubeService, musicPlayer } = this.props;
    return (
      <div>
        <h1>{folderInfo.name}</h1>
        <button type="button" onClick={() => this.playPlaylist()}>
          Play Playlist
        </button>
        <button type="button" onClick={() => musicPlayer.pause()}>
          Pause
        </button>
        <button type="button" onClick={() => musicPlayer.resume()}>
          Resume
        </button>
        {(folderInfo.playlistInfo && (
          <LibraryPlaylistInfoComponent
            musicPlayer={musicPlayer}
            videoInfos={videoInfos}
            folderInfo={folderInfo}
            youtubeService={youtubeService}
            onDownloaded={(ids) => this.downloadedVideos(ids)}
          />
        )) || (
          <LibraryPlaylistCreate
            onNewPlaylistId={(id) => this.createPlaylist(id)}
          />
        )}
      </div>
    );
  }
}
