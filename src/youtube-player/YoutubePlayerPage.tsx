import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { FaSync } from 'react-icons/fa';
import { PlaylistService } from '../services/playlist.service';
import { MusicPlayer } from './music-player/MusicPlayer';
import PlaylistQueue from './PlaylistQueue';
import { Playlists } from './Playlists';
import { Searchbar } from './Searchbar';
import PlaylistVideos from './PlaylistVideos';
import { PlaylistFolderInfo, PlaylistVideo } from '../redux/playlist/types';
import NewPlaylist from './NewPlaylist';
import LocalYoutubeDlService from '../services/local-youtube-dl.service';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface YoutubePlayerPageProps extends RouteComponentProps {}

export interface YoutubePlayerPageState {
  selectedPlaylist: PlaylistFolderInfo | null;
  playingPlaylist: PlaylistFolderInfo | null;
  playingVideo: PlaylistVideo | null;
  loading: boolean;
  videoChanged: boolean;
}

interface PathParam {
  path: string;
}

class YoutubePlayerPage extends React.Component<
  YoutubePlayerPageProps,
  YoutubePlayerPageState
> {
  private readonly playlistService: PlaylistService = new PlaylistService();

  private readonly youtubeService = new LocalYoutubeDlService();

  constructor(props: YoutubePlayerPageProps) {
    super(props);

    this.state = {
      selectedPlaylist: null,
      playingPlaylist: null,
      playingVideo: null,
      loading: false,
      videoChanged: false,
    };
  }

  private playFromCurrentPlaylist(video: PlaylistVideo) {
    const { selectedPlaylist, videoChanged } = this.state;
    this.setState({
      playingPlaylist: selectedPlaylist,
      playingVideo: video,
      videoChanged: !videoChanged,
    });
  }

  updatePlaylistVideo(video: PlaylistVideo) {
    const { selectedPlaylist } = this.state;
    const playlist = selectedPlaylist?.playlist;

    if (playlist == null) return;

    const currentVideos = playlist?.videos || [];
    const index = currentVideos.findIndex((v) => v.id === video.id);

    if (index !== -1) {
      playlist.videos[index] = video;
      this.updatePlaylistFolder({ playlist });
    }
  }

  updatePlaylistFolder(folder: Partial<PlaylistFolderInfo>) {
    const { selectedPlaylist } = this.state;

    if (selectedPlaylist != null) {
      const updated = {
        ...selectedPlaylist,
        ...folder,
      };
      this.playlistService.updatePlaylist(updated);
      this.setState({
        selectedPlaylist: updated,
      });
    }
  }

  private async loadPlaylistVideos(
    playlistId = this.state.selectedPlaylist?.playlist?.playlistId
  ) {
    if (!playlistId) {
      console.log('Cannot load playlist videos without id');
      return;
    }

    const { loading, selectedPlaylist } = this.state;
    if (loading) {
      console.log('Already loading something');
      return;
    }

    this.setState({ loading: true });

    const info = await this.youtubeService.getPlaylistVideoInfos(playlistId);

    if (info != null) {
      const existingVideos = selectedPlaylist?.playlist?.videos || [];
      const mergedVideos: PlaylistVideo[] = [];

      info.entries.forEach((e) => {
        // Load thumbnail to cache earlier
        this.youtubeService.getThumbnail(e.id);

        const entry: PlaylistVideo = {
          id: e.id,
          title: e.title,
        };

        const existing = existingVideos.find((v) => v.id === e.id);
        if (!existing) {
          mergedVideos.push(entry);
        } else {
          mergedVideos.push({
            ...existing,
            ...entry,
          });
        }
      });

      this.updatePlaylistFolder({
        playlist: {
          playlistId,
          videos: mergedVideos,
          title: info.title,
        },
      });
    }

    this.setState({ loading: false });
  }

  private playableVideos(): PlaylistVideo[] {
    return (
      this.state.playingPlaylist?.playlist.videos.filter((v) => !v.disabled) ||
      []
    );
  }

  render() {
    const { selectedPlaylist, playingVideo, videoChanged } = this.state;
    const param = this.props.match.params as PathParam;

    let mainPage = null;

    if (selectedPlaylist) {
      if (selectedPlaylist.playlist?.playlistId) {
        mainPage = (
          <PlaylistVideos
            youtubeService={this.youtubeService}
            playlist={selectedPlaylist.playlist}
            playlistFolder={selectedPlaylist.fullPath}
            onVideoClick={(v) => this.playFromCurrentPlaylist(v)}
            onPlaylistUpdate={(p) => this.updatePlaylistFolder({ playlist: p })}
            onVideoUpdate={(v) => this.updatePlaylistVideo(v)}
          />
        );
      } else {
        mainPage = (
          <NewPlaylist
            youtubeService={this.youtubeService}
            onNewPlaylist={(i) => this.loadPlaylistVideos(i)}
          />
        );
      }
    }

    return (
      <div className="grid">
        <div className="browser">
          <Playlists
            selectedPlaylist={selectedPlaylist}
            playlistFolder={decodeURIComponent(param.path)}
            playlistService={this.playlistService}
            onPlaylistSelected={(i) => this.setState({ selectedPlaylist: i })}
          />
          {playingVideo && (
            <img
              src={this.youtubeService.getThumbnail(playingVideo.id)}
              alt="Playing Video Thumbnail"
              className="fit"
            />
          )}
        </div>
        <div className="search">
          <Searchbar />
          {selectedPlaylist && (
            <FaSync
              className="pointer"
              onClick={() => this.loadPlaylistVideos()}
              title="Reload playlist videos"
            />
          )}
        </div>

        <div className="main">{mainPage}</div>
        <div className="queue">
          {playingVideo && (
            <PlaylistQueue playingVideo={playingVideo} nextQueue={[]} />
          )}
        </div>
        <div className="player">
          <MusicPlayer
            videoChanged={videoChanged}
            playingVideos={this.playableVideos()}
            playingVideo={playingVideo}
            onVideoPlay={(v) =>
              this.setState({ playingVideo: v, videoChanged: !videoChanged })
            }
          />
        </div>
      </div>
    );
  }
}

export default YoutubePlayerPage;
