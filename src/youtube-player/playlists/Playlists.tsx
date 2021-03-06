import React, { ChangeEvent } from 'react';
import * as fs from 'fs-extra';
import { Close } from '@material-ui/icons';
import { Snackbar, IconButton } from '@material-ui/core';
import { PlaylistFolderInfo } from '../types';
import { PlaylistService } from '../../services/playlist.service';
import InputField from '../../components/InputField';
import FlexBox from '../../components/FlexBox';

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

  private setCreatePlaylistName({
    target,
  }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
    if (folder === '') return;

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
            className="btn-2"
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
      <div className="flex-vertical" style={{ gap: '1em' }}>
        <div>{playlistFolder}</div>
        <button
          type="button"
          className="btn-2"
          onClick={() =>
            this.setState((e) => ({
              showCreatePlaylist: !e.showCreatePlaylist,
            }))
          }
        >
          Create Folder
        </button>

        <Snackbar
          open={!!createPlaylistError}
          autoHideDuration={3000}
          onClose={() => this.setState({ createPlaylistError: '' })}
          message={createPlaylistError}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => this.setState({ createPlaylistError: '' })}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        />
        {showCreatePlaylist && (
          <div className="flex-horizontal" style={{ gap: '0.5em' }}>
            <InputField
              style={{ background: '#3f3f3f' }}
              value={createPlaylistName}
              onChange={(e) => this.setCreatePlaylistName(e)}
            />
            <button
              className="btn-2"
              style={{ flexShrink: 1, width: 'unset' }}
              type="button"
              onClick={() => this.createPlaylist()}
            >
              Create
            </button>
          </div>
        )}
        <ul>{playlists}</ul>
      </div>
    );
  }
}
