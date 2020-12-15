import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  LibraryFolderInfo,
  LibraryService,
} from '../../services/library.service';
import LocalYoutubeDlService from '../../services/local-youtube-dl.service';
import AudioController from '../../services/music-player/audio-controller';
import { MusicPlayer } from '../../services/music-player/music-player.service';
import { VideoInfo, YoutubeService } from '../../services/youtube.service';
import LibraryBrowser from './LibraryBrowser';
import LibraryPlaylist from './LibraryPlaylist';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LibraryPageProps extends RouteComponentProps {}

export interface LibraryPageState {
  folderInfos: LibraryFolderInfo[];
  selectedFolder: LibraryFolderInfo | null;
  videoInfos: VideoInfo[];
  libraryService: LibraryService;
}

interface PathParam {
  path: string;
}

export class LibraryPage extends React.Component<
  LibraryPageProps,
  LibraryPageState
> {
  private static createLibraryService(props: LibraryPageProps) {
    const { path } = props.match.params as { path: string };
    return new LibraryService(decodeURIComponent(path));
  }

  private readonly youtubeService: YoutubeService = new LocalYoutubeDlService();

  private readonly musicPlayer: MusicPlayer = new AudioController(100);

  constructor(props: LibraryPageProps) {
    super(props);

    this.state = {
      folderInfos: [],
      videoInfos: [],
      selectedFolder: null,
      libraryService: LibraryPage.createLibraryService(props),
    };
  }

  static getDerivedStateFromProps(
    nextProps: LibraryPageProps,
    prevState: LibraryPageState
  ): LibraryPageState {
    return {
      ...prevState,
      libraryService: LibraryPage.createLibraryService(nextProps),
    };
  }

  componentDidMount() {
    this.loadFolderInfos();
  }

  componentDidUpdate(prevProps: LibraryPageProps) {
    const { match } = this.props;
    const prevParam = prevProps.match.params as PathParam;
    const param = match.params as PathParam;

    if (prevParam.path !== param.path) {
      this.loadFolderInfos();
    }
  }

  private setSelectedFolder(folder: LibraryFolderInfo): void {
    this.setState({
      selectedFolder: folder,
      videoInfos: [],
    });
    this.loadVideoInfos(folder);
  }

  private async loadVideoInfos(folder: LibraryFolderInfo) {
    const videoInfos = await this.youtubeService.getPlaylistVideoInfos(
      folder.playlistInfo.playlistId
    );
    this.setState({ videoInfos });
  }

  private async loadFolderInfos(updated: LibraryFolderInfo | null = null) {
    const { libraryService } = this.state;
    const folderInfos = await libraryService.getLibraryFolderInfos();
    this.setState({
      folderInfos,
      selectedFolder: updated,
    });
  }

  private async updateFolderInfo(info: LibraryFolderInfo) {
    const { libraryService } = this.state;
    await libraryService.updateLibraryPlaylist(info);
    await this.loadFolderInfos();
  }

  render() {
    const { folderInfos, selectedFolder, videoInfos } = this.state;

    return (
      <div className="flex-horizontal">
        <LibraryBrowser
          folderInfos={folderInfos}
          onFolderSelect={(info) => this.setSelectedFolder(info)}
        />
        {selectedFolder && (
          <LibraryPlaylist
            musicPlayer={this.musicPlayer}
            videoInfos={videoInfos}
            youtubeService={this.youtubeService}
            folderInfo={selectedFolder}
            onFolderInfoChange={(info) => this.updateFolderInfo(info)}
          />
        )}
      </div>
    );
  }
}
