import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
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
    };
  }

  private playFromCurrentPlaylist(video: PlaylistVideo) {
    const { selectedPlaylist } = this.state;
    this.setState({
      playingPlaylist: selectedPlaylist,
      playingVideo: video,
    });
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

  render() {
    const { selectedPlaylist, playingVideo, playingPlaylist } = this.state;
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
            onDownloaded={(p) => this.updatePlaylistFolder({ playlist: p })}
          />
        );
      } else {
        mainPage = (
          <NewPlaylist
            youtubeService={this.youtubeService}
            onNewPlaylist={(i) => this.updatePlaylistFolder(i)}
          />
        );
      }
    }

    return (
      <div>
        <div className="flex-horizontal">
          <div className="flex-vertical" style={{ flexShrink: 2 }}>
            <Playlists
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
          <div style={{ flexGrow: 2 }}>
            <Searchbar />
            {mainPage}
          </div>
          {playingVideo && (
            <PlaylistQueue playingVideo={playingVideo} nextQueue={[]} />
          )}
        </div>
        <MusicPlayer
          playingVideos={playingPlaylist?.playlist.videos || []}
          playingVideo={playingVideo}
          onVideoPlay={(v) => this.setState({ playingVideo: v })}
        />
      </div>
    );
  }
}

export default YoutubePlayerPage;
