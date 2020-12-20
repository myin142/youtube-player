import React, { ChangeEvent } from 'react';
import { PlaylistFolderInfo } from '../redux/playlist/types';
import { YoutubeService } from '../services/youtube.service';

interface NewPlaylistProps {
  youtubeService: YoutubeService;
  onNewPlaylist: (i: Partial<PlaylistFolderInfo>) => void;
}

interface NewPlaylistState {
  playlistId: string;
  loading: boolean;
}

export default class NewPlaylist extends React.Component<
  NewPlaylistProps,
  NewPlaylistState
> {
  constructor(props: NewPlaylistProps) {
    super(props);
    this.state = {
      playlistId: '',
      loading: false,
    };
  }

  private async onCreatePlaylist() {
    const { onNewPlaylist, youtubeService } = this.props;
    const { playlistId } = this.state;

    this.setState({ loading: true });

    const info = await youtubeService.getPlaylistVideoInfos(playlistId);

    if (info != null) {
      // Load thumbnail to cache earlier
      youtubeService.getThumbnail(playlistId);

      this.setState({ playlistId: '', loading: false });
      onNewPlaylist({
        playlist: {
          playlistId,
          videos: info.entries.map((e) => ({
            id: e.id,
            title: e.title,
          })),
          title: info.title,
        },
      });
    }
  }

  private setPlaylistId({ target }: ChangeEvent<HTMLInputElement>) {
    this.setState({ playlistId: target.value });
  }

  render() {
    const { playlistId, loading } = this.state;
    return (
      <div>
        <input value={playlistId} onChange={this.setPlaylistId.bind(this)} />
        <button
          type="button"
          onClick={() => this.onCreatePlaylist()}
          disabled={loading}
        >
          Create Playlist
        </button>
      </div>
    );
  }
}
