/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import VideoItem from '../../components/VideoItem';
import YoutubeVideoList from '../../components/YoutubeVideoList';
import { LibraryFolderInfo } from '../../services/library.service';
import {
  VideoDownloadResult,
  VideoInfo,
  YoutubeService,
} from '../../services/youtube.service';

interface LibraryPlaylistInfoProps {
  folderInfo: LibraryFolderInfo;
  youtubeService: YoutubeService;
  onDownloaded: (ids: VideoDownloadResult[]) => void;
}

interface LibraryPlaylistInfoState {
  videoInfos: VideoInfo[];
}

export default class LibraryPlaylistInfoComponent extends React.Component<
  LibraryPlaylistInfoProps,
  LibraryPlaylistInfoState
> {
  constructor(props: LibraryPlaylistInfoProps) {
    super(props);
    this.state = {
      videoInfos: [],
    };
  }

  async componentDidMount() {
    this.loadVideoInfos();
  }

  private async loadVideoInfos() {
    const { folderInfo, youtubeService } = this.props;
    const videoInfos = await youtubeService.getPlaylistVideoInfos(
      folderInfo.playlistInfo.playlistId
    );
    this.setState({ videoInfos });
  }

  render() {
    const { videoInfos } = this.state;
    const { folderInfo, youtubeService, onDownloaded } = this.props;

    const videos = folderInfo.playlistInfo.videos || [];
    const videoItems = videos.map((v) => {
      return (
        <li key={v.id}>
          <VideoItem name={v.name} thumbnail={v.thumbnail} />
        </li>
      );
    });

    const nonSyncedVideos = videoInfos.filter(
      (i) => videos.findIndex((v) => v.id === i.id) === -1
    );

    return (
      <div>
        {videos.length > 0 && (
          <div>
            <h2>Downloaded Videos</h2>
            <ul>{videoItems}</ul>
          </div>
        )}
        {nonSyncedVideos.length > 0 && (
          <div>
            <h2>Not downloaded videos</h2>
            <YoutubeVideoList
              videoInfos={nonSyncedVideos}
              youtubeService={youtubeService}
              downloadFolder={folderInfo.fullPath}
              onDownloaded={onDownloaded}
            />
          </div>
        )}
      </div>
    );
  }
}
