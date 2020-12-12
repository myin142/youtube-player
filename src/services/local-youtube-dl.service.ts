import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import {
  VideoDownloadOptions,
  VideoInfo,
  YoutubeService,
} from './youtube.service';

export default class LocalYoutubeDlService implements YoutubeService {
  private cmd: ChildProcessWithoutNullStreams | null = null;

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

  public async getThumbnail(id: string): Promise<string> {
    const url = await this.executeYoutubeDL(['--get-thumbnail', '--', id]);
    return url.length > 0 ? url[0] : '';
  }

  async downloadVideo({ id, location }: VideoDownloadOptions): Promise<void> {
    try {
      await this.executeYoutubeDL([
        '--output',
        `${location}/%(title)s.%(ext)s`,
        '--format',
        'bestaudio/best',
        '--',
        id,
      ]);
    } catch (err) {
      console.log('Download failed');
    }
  }

  stopAction(): boolean {
    if (this.cmd != null) {
      return this.cmd.kill();
    }

    return false;
  }

  private async executeYoutubeDL(args: string[]): Promise<string[]> {
    const cmd = spawn('youtube-dl', args);
    this.cmd = cmd;

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
