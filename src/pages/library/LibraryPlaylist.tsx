import React from 'react';
import {
  LibraryFolderInfo,
  LibraryPlaylistVideo,
} from '../../services/library.service';
import {
  VideoDownloadResult,
  VideoInfo,
  YoutubeService,
} from '../../services/youtube.service';
import LibraryPlaylistCreate from './LibraryPlaylistCreate';
import LibraryPlaylistInfoComponent from './LibraryPlaylistInfoComponent';

interface LibraryPlaylistProps {
  youtubeService: YoutubeService;
  folderInfo: LibraryFolderInfo;
  videoInfos: VideoInfo[];
  onFolderInfoChange: (info: LibraryFolderInfo) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LibraryPlaylistState {}

export default class LibraryPlaylist extends React.Component<
  LibraryPlaylistProps,
  LibraryPlaylistState
> {
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
    const { folderInfo, onFolderInfoChange, youtubeService } = this.props;
    const newVideoInfos: LibraryPlaylistVideo[] = result.map((x) => {
      return {
        id: x.id,
        name: x.name,
        thumbnail: youtubeService.getThumbnail(x.id),
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
    const { folderInfo, videoInfos, youtubeService } = this.props;
    return (
      <div>
        <h1>{folderInfo.name}</h1>
        {(folderInfo.playlistInfo && (
          <LibraryPlaylistInfoComponent
            videoInfos={videoInfos}
            folderInfo={folderInfo}
            youtubeService={youtubeService}
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
