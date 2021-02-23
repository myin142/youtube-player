import { Tooltip, IconButton } from '@material-ui/core';
import { Sync, Edit } from '@material-ui/icons';
import { cloneDeep } from 'lodash';
import React from 'react';
import FlexBox from '../components/FlexBox';
import IconToggle from '../components/IconToggle';
import { YoutubeService } from '../services/youtube.service';
import NewPlaylist from './playlists/NewPlaylist';
import PlaylistVideos from './playlists/PlaylistVideos';
import { Searchbar } from './Searchbar';
import { PlaylistFolderInfo, PlaylistVideo } from './types';

interface MainPanelProps {
  youtubeService: YoutubeService;
  selectedPlaylist: PlaylistFolderInfo;
  onReload: (p?: PlaylistFolderInfo) => void;
  onPlay: (v: PlaylistVideo) => void;
  onUpdateFolder: (f: PlaylistFolderInfo) => void;
}

interface MainPanelState {
  editPlaylist: PlaylistFolderInfo | null;
}

export class MainPanel extends React.Component<MainPanelProps, MainPanelState> {
  constructor(props: MainPanelProps) {
    super(props);

    this.state = {
      editPlaylist: null,
    };
  }

  private onPlaylistIdChange(id: string) {
    const { editPlaylist } = this.state;
    if (editPlaylist && editPlaylist.playlist) {
      editPlaylist.playlist.playlistId = id;
    }
    this.setState({
      editPlaylist,
    });
  }

  private onVideoChange(video: PlaylistVideo) {
    const { editPlaylist } = this.state;
    if (editPlaylist && editPlaylist.playlist) {
      const videoIndex = editPlaylist.playlist.videos.findIndex(
        (v) => v.id === video.id
      );
      if (videoIndex !== -1) {
        editPlaylist.playlist.videos[videoIndex] = video;
      }
    }
    this.setState({
      editPlaylist,
    });
  }

  private toggleEdit() {
    if (this.state.editPlaylist) {
      this.stopEdit();
    } else {
      this.startEdit();
    }
  }

  private startEdit() {
    const currPlaylist = cloneDeep(this.props.selectedPlaylist);
    this.setState({
      editPlaylist: currPlaylist,
    });
  }

  private stopEdit() {
    if (this.state.editPlaylist) {
      this.props.onUpdateFolder(this.state.editPlaylist);
    }

    this.setState({
      editPlaylist: null,
    });
  }

  render() {
    const {
      selectedPlaylist,
      youtubeService,
      onReload,
      onPlay,
      onUpdateFolder,
    } = this.props;
    const { editPlaylist } = this.state;
    const editMode = !!editPlaylist;

    return (
      <>
        <div
          className="flex-horizontal main-padding"
          style={{ justifyContent: 'space-between' }}
        >
          <Searchbar />

          <FlexBox flexShrink={1}>
            {selectedPlaylist && (
              <>
                <Tooltip title="Reload playlist videos">
                  <IconButton onClick={() => onReload()}>
                    <Sync />
                  </IconButton>
                </Tooltip>
                <IconToggle
                  active={editMode}
                  onClick={() => this.toggleEdit()}
                  title="Edit playlist videos"
                >
                  <Edit />
                </IconToggle>
              </>
            )}
          </FlexBox>
        </div>

        <main className="scroll">
          <div className="main-padding">
            {(selectedPlaylist.playlist?.playlistId && (
              <PlaylistVideos
                youtubeService={youtubeService}
                playlist={selectedPlaylist}
                onVideoClick={(v) => onPlay(v)}
                onPlaylistUpdate={(p) => onUpdateFolder(p)}
                onVideoUpdate={(v) => this.onVideoChange(v)}
                onPlaylistIdChange={(id) => this.onPlaylistIdChange(id)}
                editPlaylist={editPlaylist}
              />
            )) || (
              <NewPlaylist
                playlist={selectedPlaylist}
                youtubeService={youtubeService}
                onNewPlaylist={(i) => onReload(i)}
              />
            )}
          </div>
        </main>
      </>
    );
  }
}
