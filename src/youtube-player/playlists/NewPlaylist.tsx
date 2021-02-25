import React, { ChangeEvent } from 'react';
import FlexBox from '../../components/FlexBox';
import InputField from '../../components/InputField';
import { YoutubeService } from '../../services/youtube.service';
import { PlaylistFolderInfo } from '../types';

interface NewPlaylistProps {
  playlist: PlaylistFolderInfo;
  youtubeService: YoutubeService;
  onNewPlaylist: (plalist: PlaylistFolderInfo) => void;
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
    const { onNewPlaylist, playlist } = this.props;
    const { playlistId } = this.state;
    this.setState({ loading: true });
    onNewPlaylist({
      ...playlist,
      playlist: {
        ...playlist.playlist,
        playlistId,
      },
    });
  }

  private setPlaylistId({
    target,
  }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    this.setState({ playlistId: target.value });
  }

  render() {
    const { playlistId, loading } = this.state;
    return (
      <FlexBox flexDirection="row" style={{ alignItems: 'stretch' }}>
        <InputField
          value={playlistId}
          onChange={(e) => this.setPlaylistId(e)}
        />
        <button
          className="btn-1"
          style={{ padding: '.5em 1em', whiteSpace: 'nowrap', width: 'unset' }}
          type="button"
          onClick={() => this.onCreatePlaylist()}
          disabled={loading}
        >
          Create Playlist
        </button>
      </FlexBox>
    );
  }
}
