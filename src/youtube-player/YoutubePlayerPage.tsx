import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IconButton, Tooltip } from '@material-ui/core';
import { Edit, Sync } from '@material-ui/icons';
import { PlaylistService } from '../services/playlist.service';
import { MusicPlayer } from './music-player/MusicPlayer';
import PlaylistQueue from './playlists/PlaylistQueue';
import { Playlists } from './playlists/Playlists';
import { Searchbar } from './Searchbar';
import PlaylistVideos from './playlists/PlaylistVideos';
import { PlaylistFolderInfo, PlaylistVideo } from './types';
import NewPlaylist from './playlists/NewPlaylist';
import LocalYoutubeDlService from '../services/local-youtube-dl.service';
import FlexBox from '../components/FlexBox';
import IconToggle from '../components/IconToggle';

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
  editMode: boolean;
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
      editMode: false,
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
    const selectedPlaylist = playlist;
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
      editMode,
      dirtyQueue,
    } = this.state;
    const param = this.props.match.params as PathParam;

    let mainPage = null;

    if (selectedPlaylist) {
      if (selectedPlaylist.playlist?.playlistId) {
        mainPage = (
          <PlaylistVideos
            youtubeService={this.youtubeService}
            playlist={selectedPlaylist}
            onVideoClick={(v) => this.playFromCurrentPlaylist(v)}
            onPlaylistUpdate={(p) => this.updatePlaylistFolder(p)}
            onVideoUpdate={(v) => this.updatePlaylistVideo(v)}
            editMode={editMode}
          />
        );
      } else {
        mainPage = (
          <NewPlaylist
            playlist={selectedPlaylist}
            youtubeService={this.youtubeService}
            onNewPlaylist={(i) => this.loadPlaylistVideos(i)}
          />
        );
      }
    }

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
            <div
              className="flex-horizontal main-padding"
              style={{ justifyContent: 'space-between' }}
            >
              <Searchbar />

              <FlexBox flexShrink={1}>
                {selectedPlaylist && (
                  <>
                    <Tooltip title="Reload playlist videos">
                      <IconButton onClick={() => this.loadPlaylistVideos()}>
                        <Sync />
                      </IconButton>
                    </Tooltip>
                    <IconToggle
                      active={editMode}
                      onClick={() => this.setState({ editMode: !editMode })}
                      title="Edit playlist videos"
                    >
                      <Edit />
                    </IconToggle>
                  </>
                )}
              </FlexBox>
            </div>

            <main className="scroll">
              <div className="main-padding">{mainPage}</div>
            </main>
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
      </>
    );
  }
}

export default YoutubePlayerPage;
