import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  LibraryFolderInfo,
  LibraryService,
} from '../../services/library.service';
import LocalYoutubeDlService from '../../services/local-youtube-dl.service';
import { VideoInfo, YoutubeService } from '../../services/youtube.service';
import LibraryBrowser from './LibraryBrowser';
import LibraryPlaylist from './LibraryPlaylist';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LibraryPageProps extends RouteComponentProps {
  libraryService: LibraryService;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LibraryPageState {
  folderInfos: LibraryFolderInfo[];
  selectedFolder: LibraryFolderInfo | null;
  videoInfos: VideoInfo[];
}

export class LibraryPage extends React.Component<
  LibraryPageProps,
  LibraryPageState
> {
  private static createLibraryService(props: LibraryPageProps) {
    const { path } = props.match.params as { path: string };
    console.log(path);
    return new LibraryService(decodeURIComponent(path));
  }

  // TODO: share services
  private readonly libraryService: LibraryService;

  private readonly youtubeService: YoutubeService = new LocalYoutubeDlService();

  constructor(props: LibraryPageProps) {
    super(props);

    this.state = {
      folderInfos: [],
      videoInfos: [],
      selectedFolder: null,
    };
    this.libraryService =
      props.libraryService || LibraryPage.createLibraryService(props);
  }

  async componentDidMount() {
    this.loadFolderInfos();
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
    const folderInfos = await this.libraryService.getLibraryFolderInfos();
    this.setState({
      folderInfos,
      selectedFolder: updated,
    });
  }

  private async updateFolderInfo(info: LibraryFolderInfo) {
    await this.libraryService.updateLibraryPlaylist(info);
    this.loadFolderInfos(info);
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
