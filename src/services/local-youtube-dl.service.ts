import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import {
  VideoDownloadOptions,
  VideoInfo,
  YoutubeService,
} from './youtube.service';

export default class LocalYoutubeDlService implements YoutubeService {
  private cmd: ChildProcessWithoutNullStreams | null = null;

  // TODO: save in cache folder
  private thumbnailCache: { [id: string]: string } = {};

  private thumbnailCmd: { [id: string]: ChildProcessWithoutNullStreams } = {};

  async getPlaylistVideoInfos(playlist: string): Promise<VideoInfo[]> {
    let outputs: string[] = [];
    try {
      outputs = await this.executeYoutubeDL([
        '--skip-download',
        '--flat-playlist',
        '-J',
        '--',
        playlist,
      ]);
    } catch (err) {
      console.log(err);
    }

    if (outputs.length === 0) {
      return [];
    }

    const data = JSON.parse(outputs[0]);
    // eslint-disable-next-line no-underscore-dangle
    if (data._type !== 'playlist') {
      return [];
    }

    return Promise.all(
      data.entries.map((v: YoutubeVideoInfo) =>
        LocalYoutubeDlService.youtubeToVideoInfo(v)
      )
    );
  }

  private static async youtubeToVideoInfo({
    id,
    title,
  }: YoutubeVideoInfo): Promise<VideoInfo> {
    return {
      id,
      title,
    };
  }

  public getThumbnail(id: string): string {
    if (this.thumbnailCache[id]) {
      return this.thumbnailCache[id];
    }

    if (this.thumbnailCmd[id]) {
      return '';
    }

    this.executeYoutubeDL(['--get-thumbnail', '--', id], (cmd) => {
      this.thumbnailCmd[id] = cmd;
    })
      .then((urls) => {
        const thumbnail = urls.length > 0 ? urls[0] : '';
        if (thumbnail) {
          this.thumbnailCache[id] = thumbnail;
        }
        return thumbnail;
      })
      .catch((err) => {
        console.log(err);
      });
    return '';
  }

  async downloadVideo({
    id,
    location,
  }: VideoDownloadOptions): Promise<string[]> {
    try {
      const outputs = await this.executeYoutubeDL([
        '--output',
        `${location}/%(title)s.%(ext)s`,
        '--format',
        'bestaudio/best',
        '--',
        id,
      ]);

      const lines = outputs.join('\n').split('\n');
      return lines
        .map((line) => {
          if (line.includes('Destination: ')) {
            return line.substr(line.indexOf(location)).trim();
          }

          if (line.includes('has already been downloaded')) {
            return line.substr(line.indexOf(location)).split('has')[0].trim();
          }
          return null;
        })
        .filter((x) => x)
        .map((fullPath) => {
          if (fullPath == null) return null;
          const parts = fullPath.split('/');
          return parts[parts.length - 1];
        }) as string[];
    } catch (err) {
      console.log('Download failed');
    }

    return [];
  }

  stopAction(): boolean {
    if (this.cmd != null) {
      return this.cmd.kill();
    }

    return false;
  }

  private async executeYoutubeDL(
    args: string[],
    saveCmd = (cmd: ChildProcessWithoutNullStreams) => {
      this.cmd = cmd;
    }
  ): Promise<string[]> {
    const cmd = spawn('youtube-dl', args);
    saveCmd(cmd);

    return new Promise((resolve, reject) => {
      const outputs: string[] = [];

      cmd.stdout.on('data', (data: Buffer) => {
        const output = data.toString('utf-8');
        outputs.push(output);
        console.log(output);
      });

      cmd.stderr.on('data', (err: Buffer) => {
        console.log('Error', err.toString('utf-8'));
      });

      cmd.on('exit', (code) => {
        if (code === 0) {
          resolve(outputs);
        } else {
          reject(new Error(`${code}`));
        }
        this.cmd = null;
      });
    });
  }
}

interface YoutubeVideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
}
