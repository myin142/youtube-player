import { timeStamp } from 'console';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  LibraryFolderInfo,
  LibraryService,
} from '../../services/library.service';
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
}

export class LibraryPage extends React.Component<
  LibraryPageProps,
  LibraryPageState
> {
  private static createLibraryService(props: LibraryPageProps) {
    const { path } = props.match.params as { path: string };
    return new LibraryService(decodeURIComponent(path));
  }

  private readonly libraryService: LibraryService;

  constructor(props: LibraryPageProps) {
    super(props);

    this.state = {
      folderInfos: [],
      selectedFolder: null,
    };
    this.libraryService =
      props.libraryService || LibraryPage.createLibraryService(props);
  }

  async componentDidMount() {
    this.loadFolderInfos();
  }

  private setSelectedFolder(folder: LibraryFolderInfo): void {
    this.setState({ selectedFolder: folder });
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
    const { folderInfos, selectedFolder } = this.state;

    return (
      <div className="flex-horizontal">
        <LibraryBrowser
          folderInfos={folderInfos}
          onFolderSelect={(info) => this.setSelectedFolder(info)}
        />
        {selectedFolder && (
          <LibraryPlaylist
            folderInfo={selectedFolder}
            onFolderInfoChange={(info) => this.updateFolderInfo(info)}
          />
        )}
      </div>
    );
  }
}
