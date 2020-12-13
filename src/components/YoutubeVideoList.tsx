import React from 'react';
import { FaDownload } from 'react-icons/fa';
import {
  VideoDownloadResult,
  VideoFormat,
  VideoInfo,
  YoutubeService,
} from '../services/youtube.service';
import VideoItem from './VideoItem';

interface YoutubeVideoListProps {
  videoInfos: VideoInfo[];
  youtubeService: YoutubeService;
  downloadFolder: string;
  onDownloaded: (ids: VideoDownloadResult[]) => void;
  hideDownload?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface YoutubeVideoListState {
  downloading: boolean;
}

export default class YoutubeVideoList extends React.Component<
  YoutubeVideoListProps,
  YoutubeVideoListState
> {
  constructor(props: YoutubeVideoListProps) {
    super(props);
    this.state = {
      downloading: false,
    };
  }

  private getThumbnail({ id }: VideoInfo): string {
    const { youtubeService } = this.props;
    return youtubeService.getThumbnail(id);
  }

  async download(ids: string[]) {
    const { downloading } = this.state;
    const { onDownloaded, youtubeService, downloadFolder } = this.props;
    if (downloading) {
      console.log('Already downloading something');
      return;
    }

    this.setState({ downloading: true });
    const result: VideoDownloadResult[] = await Promise.all(
      ids.map(async (id) => {
        const names = await youtubeService.downloadVideo({
          id,
          format: VideoFormat.AUDIO,
          location: downloadFolder,
        });
        return { id, name: names[0] };
      })
    );
    onDownloaded(result);
    this.setState({ downloading: false });
  }

  async downloadAll() {
    const { videoInfos } = this.props;
    this.download(videoInfos.map((v) => v.id));
  }

  render() {
    const { videoInfos, hideDownload } = this.props;
    const { downloading } = this.state;

    const videosItems = videoInfos.map((info) => {
      const thumbnail = this.getThumbnail(info);
      return (
        <li key={info.id}>
          {!hideDownload && !downloading && (
            <FaDownload
              role="button"
              tabIndex={0}
              className="pointer"
              onClick={() => this.download([info.id])}
              onKeyPress={() => this.download([info.id])}
              aria-label="Download"
            />
          )}
          <VideoItem name={info.title} thumbnail={thumbnail} />
        </li>
      );
    });

    return (
      <div>
        {downloading && <div>Downloading</div>}
        <button type="button" onClick={() => this.downloadAll()}>
          Download All
        </button>
        <ul>{videosItems}</ul>
      </div>
    );
  }
}
