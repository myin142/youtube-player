import React from 'react';
import {
  LibraryFolderInfo,
  LibraryPlaylistVideo,
} from '../../services/library.service';
import LocalYoutubeDlService from '../../services/local-youtube-dl.service';
import {
  VideoDownloadResult,
  YoutubeService,
} from '../../services/youtube.service';
import LibraryPlaylistCreate from './LibraryPlaylistCreate';
import LibraryPlaylistInfoComponent from './LibraryPlaylistInfoComponent';

interface LibraryPlaylistProps {
  folderInfo: LibraryFolderInfo;
  onFolderInfoChange: (info: LibraryFolderInfo) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LibraryPlaylistState {}

export default class LibraryPlaylist extends React.Component<
  LibraryPlaylistProps,
  LibraryPlaylistState
> {
  // TODO: share
  private readonly youtubeService: YoutubeService = new LocalYoutubeDlService();

  constructor(props: LibraryPlaylistProps) {
    super(props);
    this.state = {};
  }

  private createPlaylist(id: string): void {
    const { folderInfo, onFolderInfoChange } = this.props;
    const newInfo: LibraryFolderInfo = {
      ...folderInfo,
      playlistInfo: {
        playlistId: id,
        videos: [],
      },
    };

    onFolderInfoChange(newInfo);
  }

  private downloadedVideos(result: VideoDownloadResult[]): void {
    const { folderInfo, onFolderInfoChange } = this.props;
    const newVideoInfos: LibraryPlaylistVideo[] = result.map((x) => {
      return {
        id: x.id,
        name: x.name,
        thumbnail: this.youtubeService.getThumbnail(x.id),
      };
    });
    const videos = folderInfo.playlistInfo.videos || [];
    videos.push(...newVideoInfos);

    const updatedInfo: LibraryFolderInfo = {
      ...folderInfo,
      playlistInfo: {
        ...folderInfo.playlistInfo,
        videos,
      },
    };

    onFolderInfoChange(updatedInfo);
  }

  render() {
    const { folderInfo } = this.props;
    return (
      <div>
        <h1>{folderInfo.name}</h1>
        {(folderInfo.playlistInfo && (
          <LibraryPlaylistInfoComponent
            folderInfo={folderInfo}
            youtubeService={this.youtubeService}
            onDownloaded={(ids) => this.downloadedVideos(ids)}
          />
        )) || (
          <LibraryPlaylistCreate
            onNewPlaylistId={(id) => this.createPlaylist(id)}
          />
        )}
      </div>
    );
  }
}
