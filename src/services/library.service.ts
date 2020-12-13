import * as fs from 'fs-extra';

export class LibraryService {
  private static PLAYLIST_INFO_FILE = '.yt-plyr-info';

  constructor(private path: string, private filesystem = fs) {}

  async updateLibraryPlaylist({
    fullPath,
    playlistInfo,
  }: LibraryFolderInfo): Promise<void> {
    await this.filesystem.outputJSON(
      LibraryService.infoPath(fullPath),
      playlistInfo
    );
  }

  async getLibraryFolderInfos(): Promise<LibraryFolderInfo[]> {
    const files = await this.filesystem.readdir(this.path);
    return files
      .filter((file) => {
        const fullPath = this.fullPath(file);
        return (
          this.filesystem.existsSync(fullPath) &&
          this.filesystem.statSync(fullPath).isDirectory()
        );
      })
      .map((folder) => {
        const fullPath = this.fullPath(folder);
        const infoPath = LibraryService.infoPath(fullPath);
        let info = null;
        if (this.filesystem.existsSync(infoPath)) {
          info = this.filesystem.readJSONSync(infoPath);
        }
        return {
          playlistInfo: info,
          fullPath,
          name: folder,
        };
      });
  }

  private fullPath(file: string): string {
    return `${this.path}/${file}`;
  }

  private static infoPath(fullPath: string): string {
    return `${fullPath}/${LibraryService.PLAYLIST_INFO_FILE}`;
  }
}

export interface LibraryFolderInfo {
  playlistInfo: LibraryPlaylistInfo;
  fullPath: string;
  name: string;
}

export interface LibraryPlaylistInfo {
  playlistId: string;
  videos: LibraryPlaylistVideo[];
}

export interface LibraryPlaylistVideo {
  id: string;
  name: string;
  thumbnail: string;
}
