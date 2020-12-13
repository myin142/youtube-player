import React, { ChangeEvent } from 'react';

interface LibraryPlaylistCreateProps {
  onNewPlaylistId: (id: string) => void;
}

interface LibraryPlaylistCreateState {
  newPlaylistInput: string;
}

export default class LibraryPlaylistCreate extends React.Component<
  LibraryPlaylistCreateProps,
  LibraryPlaylistCreateState
> {
  constructor(props: LibraryPlaylistCreateProps) {
    super(props);
    this.state = {
      newPlaylistInput: '',
    };
  }

  private onCreatePlaylist(id: string) {
    const { onNewPlaylistId } = this.props;
    onNewPlaylistId(id);
    this.setState({ newPlaylistInput: '' });
  }

  private setPlaylistInput({ target }: ChangeEvent<HTMLInputElement>) {
    this.setState({ newPlaylistInput: target.value });
  }

  render() {
    const { newPlaylistInput } = this.state;
    return (
      <div>
        <input
          type="text"
          placeholder="Playlist Id"
          value={newPlaylistInput}
          onChange={(e) => this.setPlaylistInput(e)}
        />
        <button
          type="button"
          onClick={() => this.onCreatePlaylist(newPlaylistInput)}
        >
          Create Playlist
        </button>
      </div>
    );
  }
}
