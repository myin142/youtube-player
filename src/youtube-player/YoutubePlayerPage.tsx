import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { PlaylistService } from '../services/playlist.service';
import { MusicPlayer } from './music-player/MusicPlayer';
import PlaylistQueue from './playlists/PlaylistQueue';
import { Playlists } from './playlists/Playlists';
import { PlaylistFolderInfo, PlaylistVideo } from './types';
import LocalYoutubeDlService from '../services/local-youtube-dl.service';
import { MainPanel } from './MainPanel';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface YoutubePlayerPageProps extends RouteComponentProps {}

export interface YoutubePlayerPageState {
  selectedPlaylist: PlaylistFolderInfo | null;
  playingPlaylist: PlaylistFolderInfo | null;
  playingVideo: PlaylistVideo | null;
  loading: boolean;
  videoChanged: boolean;
  queue: number[];
  dirtyQueue: boolean;
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
      queue: [],
      dirtyQueue: false,
    };
  }

  private playFromCurrentPlaylist(video: PlaylistVideo) {
    const { selectedPlaylist, videoChanged, dirtyQueue } = this.state;
    this.setState({
      playingPlaylist: selectedPlaylist,
      playingVideo: video,
      videoChanged: !videoChanged,
      dirtyQueue: !dirtyQueue,
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

  private async loadPlaylistVideos(playlist = this.state.selectedPlaylist) {
    const playlistId = playlist?.playlist.playlistId;
    const selectedPlaylist = playlist || this.state.selectedPlaylist;
    if (!playlistId) {
      console.log('Cannot load playlist videos without id');
      return;
    }

    const { loading } = this.state;
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
        ...selectedPlaylist,
        playlist: {
          ...selectedPlaylist?.playlist,
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
    const {
      selectedPlaylist,
      playingVideo,
      videoChanged,
      queue,
      dirtyQueue,
    } = this.state;
    const param = this.props.match.params as PathParam;

    return (
      <>
        <div className="container">
          <nav className="side-panel">
            <div className="panel scroll">
              <Playlists
                selectedPlaylist={selectedPlaylist}
                playlistFolder={decodeURIComponent(param.path)}
                playlistService={this.playlistService}
                onPlaylistSelected={(i) =>
                  this.setState({ selectedPlaylist: i })
                }
              />
            </div>
            {playingVideo && (
              <img
                src={this.youtubeService.getThumbnail(playingVideo.id)}
                alt="Playing Video Thumbnail"
                className="thumbnail"
              />
            )}
          </nav>
          <div className="main-container">
            {selectedPlaylist && (
              <MainPanel
                youtubeService={this.youtubeService}
                selectedPlaylist={selectedPlaylist}
                onPlay={(v) => this.playFromCurrentPlaylist(v)}
                onReload={(p) => this.loadPlaylistVideos(p)}
                onUpdateFolder={(p) => this.updatePlaylistFolder(p)}
              />
            )}
          </div>
          {playingVideo && (
            <aside className="side-panel">
              <div className="panel scroll">
                <PlaylistQueue
                  playingVideo={playingVideo}
                  queue={queue}
                  videos={this.playableVideos()}
                />
              </div>
            </aside>
          )}
        </div>
        {playingVideo && (
          <footer className="panel">
            <MusicPlayer
              videoChanged={videoChanged}
              dirtyQueue={dirtyQueue}
              playingVideos={this.playableVideos()}
              playingVideo={playingVideo}
              queue={queue}
              onVideoPlay={(v) =>
                this.setState({ playingVideo: v, videoChanged: !videoChanged })
              }
              onQueueChanged={(q) => this.setState({ queue: q })}
            />
          </footer>
        )}
      </>
    );
  }
}

export default YoutubePlayerPage;
