import React, { ChangeEvent } from 'react';
import * as fs from 'fs-extra';
import { PlaylistFolderInfo } from '../redux/types';
import { PlaylistService } from '../services/playlist.service';

export interface PlaylistsProps {
  playlistFolder: string;
  selectedPlaylist: PlaylistFolderInfo | null;
  playlistService: PlaylistService;
  onPlaylistSelected: (i: PlaylistFolderInfo | null) => void;
}

export interface PlaylistsState {
  folderInfos: PlaylistFolderInfo[];
  showCreatePlaylist: boolean;
  createPlaylistName: string;
  createPlaylistError: string;
}

export class Playlists extends React.Component<PlaylistsProps, PlaylistsState> {
  private readonly filesystem = fs;

  constructor(props: PlaylistsProps) {
    super(props);
    this.state = {
      folderInfos: [],
      showCreatePlaylist: false,
      createPlaylistName: '',
      createPlaylistError: '',
    };
  }

  componentDidMount() {
    this.loadFolderInfos();
    this.props.playlistService.addListener('playlistUpdated', () => {
      this.loadFolderInfos(false);
    });
  }

  componentDidUpdate(prevProp: PlaylistsProps) {
    if (prevProp.playlistFolder !== this.props.playlistFolder) {
      this.loadFolderInfos();
    }
  }

  private setCreatePlaylistName({ target }: ChangeEvent<HTMLInputElement>) {
    this.setState({ createPlaylistName: target.value });
  }

  private async loadFolderInfos(reset = true) {
    const { playlistFolder, playlistService, onPlaylistSelected } = this.props;
    const folderInfos = await playlistService.getLibraryFolderInfos(
      playlistFolder
    );
    this.setState({
      folderInfos,
    });
    if (reset) {
      onPlaylistSelected(null);
    }
  }

  private folderSort(a: PlaylistFolderInfo, b: PlaylistFolderInfo): number {
    if (!a.playlist || !b.playlist) {
      return a.playlist ? -1 : 1;
    }

    return a.playlist.title.localeCompare(b.playlist.title);
  }

  private async createPlaylist() {
    const { playlistFolder } = this.props;
    let folder = playlistFolder;
    if (!folder.endsWith('/')) {
      folder += '/';
    }
    folder += this.state.createPlaylistName;

    if (this.filesystem.pathExistsSync(folder)) {
      this.setState({ createPlaylistError: 'Playlist folder exists' });
    } else {
      this.filesystem.mkdir(folder);

      await this.loadFolderInfos(false);
      this.setState({
        createPlaylistError: '',
        createPlaylistName: '',
        showCreatePlaylist: false,
      });
    }
  }

  render() {
    const { onPlaylistSelected, playlistFolder, selectedPlaylist } = this.props;
    const {
      folderInfos,
      showCreatePlaylist,
      createPlaylistName,
      createPlaylistError,
    } = this.state;

    const playlists = folderInfos.sort(this.folderSort).map((i) => {
      return (
        <li key={i.fullPath}>
          <button
            type="button"
            onClick={() => onPlaylistSelected(i)}
            onKeyPress={() => onPlaylistSelected(i)}
            style={
              selectedPlaylist?.fullPath === i.fullPath
                ? { fontWeight: 'bold' }
                : {}
            }
          >
            {i.name}: {i.playlist?.title || 'Not a playlist'}
          </button>
        </li>
      );
    });

    return (
      <div>
        <div>{playlistFolder}</div>
        <button
          type="button"
          onClick={() =>
            this.setState((e) => ({
              showCreatePlaylist: !e.showCreatePlaylist,
            }))
          }
        >
          Create Playlist Folder
        </button>
        {createPlaylistError && <div>{createPlaylistError}</div>}
        {showCreatePlaylist && (
          <div>
            <input
              value={createPlaylistName}
              onChange={this.setCreatePlaylistName.bind(this)}
            />
            <button type="button" onClick={() => this.createPlaylist()}>
              Create
            </button>
          </div>
        )}
        <ul>{playlists}</ul>
      </div>
    );
  }
}
