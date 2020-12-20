import { EventEmitter } from 'events';
import * as fs from 'fs-extra';
import { PlaylistFolderInfo } from '../redux/playlist/types';

export class PlaylistService extends EventEmitter {
  private static PLAYLIST_INFO_FILE = '.yt-plyr-info';

  constructor(private filesystem = fs) {
    super();
  }

  async updatePlaylist({ fullPath, playlist }: PlaylistFolderInfo) {
    await this.filesystem.outputJSON(
      `${fullPath}/${PlaylistService.PLAYLIST_INFO_FILE}`,
      playlist
    );
    this.emit('playlistUpdated');
  }

  async getLibraryFolderInfos(path: string): Promise<PlaylistFolderInfo[]> {
    const files = await this.filesystem.readdir(path);
    return files
      .filter((file) => {
        const fullPath = `${path}/${file}`;
        return (
          this.filesystem.existsSync(fullPath) &&
          this.filesystem.statSync(fullPath).isDirectory()
        );
      })
      .map((folder) => {
        const fullPath = `${path}/${folder}`;
        const infoPath = `${fullPath}/${PlaylistService.PLAYLIST_INFO_FILE}`;
        let info = null;
        if (this.filesystem.existsSync(infoPath)) {
          info = this.filesystem.readJSONSync(infoPath);
        }
        return {
          playlist: info,
          fullPath,
          name: folder,
        };
      });
  }
}
