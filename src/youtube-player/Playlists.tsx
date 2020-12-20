import React from 'react';
import { PlaylistFolderInfo } from '../redux/playlist/types';
import { PlaylistService } from '../services/playlist.service';

export interface PlaylistsProps {
  playlistFolder: string;
  playlistService: PlaylistService;
  onPlaylistSelected: (i: PlaylistFolderInfo | null) => void;
}

export interface PlaylistsState {
  folderInfos: PlaylistFolderInfo[];
}

export class Playlists extends React.Component<PlaylistsProps, PlaylistsState> {
  constructor(props: PlaylistsProps) {
    super(props);
    this.state = {
      folderInfos: [],
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

  render() {
    const { onPlaylistSelected, playlistFolder } = this.props;
    const { folderInfos } = this.state;

    const playlists = folderInfos.sort(this.folderSort).map((i) => {
      return (
        <li key={i.fullPath}>
          <button
            type="button"
            onClick={() => onPlaylistSelected(i)}
            onKeyPress={() => onPlaylistSelected(i)}
          >
            {i.name}: {i.playlist?.title || 'Not a playlist'}
          </button>
        </li>
      );
    });

    return (
      <div>
        <div>{playlistFolder}</div>
        <button type="button">Create Playlist</button>
        <ul>{playlists}</ul>
      </div>
    );
  }
}
