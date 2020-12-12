import React, { ChangeEvent } from 'react';
import { remote } from 'electron';
import { FaDownload } from 'react-icons/fa';
import LocalYoutubeDlService from '../../services/local-youtube-dl.service';
import {
  VideoFormat,
  VideoInfo,
  YoutubeService,
} from '../../services/youtube.service';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HomePageProps {}

export interface HomePageState {
  search: string;
  searchResult: VideoInfo[];
  status: Status;
  downloadLocation: string;
  thumbnails: { [id: string]: string };
}

enum Status {
  NONE,
  SEARCHING,
  DOWNLOADING,
}

export class HomePage extends React.Component<HomePageProps, HomePageState> {
  private youtubeService: YoutubeService;

  constructor(props: HomePageProps) {
    super(props);
    this.youtubeService = new LocalYoutubeDlService();
    this.state = {
      search: 'PLhVmt2W2Ji9Ic_xK-b0uKMadGeXN-Tg18',
      searchResult: [],
      status: Status.NONE,
      downloadLocation: './',
      thumbnails: {},
    };
  }

  async search() {
    const { status, search } = this.state;
    if (status === Status.SEARCHING) {
      console.log('Already searching something');
      return;
    }
    this.setState({
      status: Status.SEARCHING,
    });

    const infos = await this.youtubeService.getPlaylistVideoInfos(search);

    this.setState({
      searchResult: infos,
      status: Status.NONE,
    });

    infos.forEach(async (info) => {
      const url = await this.youtubeService.getThumbnail(info.id);
      this.setState((prev) => {
        prev.thumbnails[info.id] = url;
        return prev;
      });
    });
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ search: event.target.value });
  }

  async selectDownloadLocation() {
    const paths = await remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (!paths.canceled && paths.filePaths.length > 0) {
      this.setState({ downloadLocation: paths.filePaths[0] });
    }
  }

  downloadSearch() {
    const { search } = this.state;
    this.download(search);
  }

  async download(id: string) {
    const { status, downloadLocation } = this.state;
    if (status === Status.DOWNLOADING) {
      console.log('Already downloading something');
      return;
    }

    this.setState({ status: Status.DOWNLOADING });
    await this.youtubeService.downloadVideo({
      id,
      format: VideoFormat.AUDIO,
      location: downloadLocation,
    });

    this.setState({ status: Status.NONE });
  }

  render() {
    const {
      searchResult,
      thumbnails,
      search,
      status,
      downloadLocation,
    } = this.state;

    const resultList = searchResult.map((r) => {
      return (
        <li key={r.id}>
          <FaDownload
            role="button"
            tabIndex={0}
            className="pointer"
            onClick={() => this.download(r.id)}
            onKeyPress={() => this.download(r.id)}
            aria-label="Download"
          />
          {thumbnails[r.id] && (
            <img
              src={thumbnails[r.id]}
              width="64px"
              alt={`${r.title} thumbnail`}
            />
          )}
          {r.title}
        </li>
      );
    });

    return (
      <div>
        <div>
          <input
            type="text"
            value={search}
            onChange={this.handleChange.bind(this)}
          />
          <button onClick={() => this.search()} type="button">
            Search
          </button>
        </div>
        <div>
          <span>{downloadLocation}</span>
          <button onClick={() => this.selectDownloadLocation()} type="button">
            Download Folder
          </button>
        </div>
        {searchResult.length > 0 && (
          <button onClick={() => this.downloadSearch()} type="button">
            Download All
          </button>
        )}

        {status !== Status.NONE && (
          <div>
            <div>{Status[status]}...</div>
            <button
              onClick={() => this.youtubeService.stopAction()}
              type="button"
            >
              Stop
            </button>
          </div>
        )}
        <ul>{resultList}</ul>
      </div>
    );
  }
}
