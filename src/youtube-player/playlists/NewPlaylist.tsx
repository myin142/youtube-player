import React, { ChangeEvent } from 'react';
import { YoutubeService } from '../../services/youtube.service';

interface NewPlaylistProps {
  youtubeService: YoutubeService;
  onNewPlaylist: (id: string) => void;
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
    const { onNewPlaylist } = this.props;
    const { playlistId } = this.state;
    this.setState({ loading: true });
    onNewPlaylist(playlistId);
  }

  private setPlaylistId({ target }: ChangeEvent<HTMLInputElement>) {
    this.setState({ playlistId: target.value });
  }

  render() {
    const { playlistId, loading } = this.state;
    return (
      <>
        <input value={playlistId} onChange={this.setPlaylistId.bind(this)} />
        <button
          type="button"
          onClick={() => this.onCreatePlaylist()}
          disabled={loading}
        >
          Create Playlist
        </button>
      </>
    );
  }
}
