/* eslint-disable no-return-assign */
import React from 'react';
import { FaPause, FaPlay, FaRandom, FaStepForward } from 'react-icons/fa';
import { PlaylistVideo } from '../../redux/playlist/types';
import { audioController } from '../../services/music-player/audio-controller';
import { MusicQueue } from './music-queue';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControls } from './VolumeControls';

export interface MusicPlayerProps {
  queue: number[];
  videoChanged: boolean;
  playingVideos: PlaylistVideo[];
  playingVideo: PlaylistVideo | null;
  onVideoPlay: (v: PlaylistVideo) => void;
  onQueueChanged: (queue: number[]) => void;
}

export interface MusicPlayerStats {
  isPlaying: boolean;
  songDuration: number;
  volume: number;
  isRandom: boolean;
}

export class MusicPlayer extends React.Component<
  MusicPlayerProps,
  MusicPlayerStats
> {
  private static VOLUME_STEPS = 0.1;

  private readonly audioController = audioController;

  constructor(props: MusicPlayerProps) {
    super(props);
    this.state = {
      isPlaying: this.audioController.isPlaying,
      songDuration: this.audioController.songDuration,
      volume: this.audioController.volume,
      isRandom: true,
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    this.clearListeners();
    document.addEventListener('keydown', this.handleKeyDown);

    this.audioController.addListener('songFinished', () =>
      this.playNextVideo()
    );
  }

  componentDidUpdate(prevProps: MusicPlayerProps) {
    const { videoChanged, playingVideos } = this.props;
    if (playingVideos.length !== prevProps.playingVideos.length) {
      this.fillQueue([]);
    }

    if (prevProps.videoChanged !== videoChanged) {
      this.play();
    }
  }

  componentWillUnmount() {
    this.clearListeners();
  }

  private fillQueue(queue: number[] = []) {
    const { onQueueChanged, playingVideos } = this.props;
    const { isRandom } = this.state;
    // TODO: use music queue globally
    const mQueue = new MusicQueue(
      {
        // Current workaround to prevent playing same video twice in a row
        max_queue: playingVideos.length < 5 ? playingVideos.length : 5,
        max_index: playingVideos.length,
        random: isRandom,
      },
      queue
    );
    onQueueChanged(mQueue.queue);
  }

  private playNextVideo() {
    const { playingVideos, queue } = this.props;

    if (playingVideos.length === 0) return;

    const vid = playingVideos[queue.shift() || 0];
    if (vid) {
      this.props.onVideoPlay(vid);
      this.fillQueue(queue);
    }
  }

  private get volume(): number {
    return this.state.volume;
  }

  private set volume(vol: number) {
    this.audioController.volume = vol;
    this.setState({ volume: this.audioController.volume });
  }

  private handleKeyDown(ev: KeyboardEvent) {
    const preventEvent = ['INPUT', 'BUTTON'];
    if (preventEvent.includes(document.activeElement?.tagName || '')) {
      return;
    }

    const keybindings: { [k: string]: () => void } = {
      ' ': () => this.toggleMusic(),
      ArrowDown: () => (this.volume -= MusicPlayer.VOLUME_STEPS),
      ArrowUp: () => (this.volume += MusicPlayer.VOLUME_STEPS),
      ArrowRight: () => this.playNextVideo(),
    };

    const fn = keybindings[ev.key];
    if (fn) {
      ev.preventDefault();
      fn();
    }
  }

  private clearListeners() {
    // Right now this class should be the only listener
    this.audioController.removeAllListeners('songFinished');
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private toggleRandom() {
    const { isRandom } = this.state;
    this.setState({ isRandom: !isRandom });
    this.fillQueue([]);
  }

  private toggleMusic() {
    if (this.props.playingVideo == null) {
      return;
    }

    const { isPlaying } = this.state;
    if (isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  private async play(video = this.props.playingVideo) {
    const { volume } = this.state;

    if (video && video.fileName) {
      await this.audioController.play(video.fileName);
      this.audioController.volume = volume;
      this.setState({
        isPlaying: true,
        songDuration: this.audioController.songDuration,
      });
    } else {
      console.warn('Cannot play not downloaded video');
    }
  }

  private async resume() {
    this.audioController.resume();
    this.setState({
      isPlaying: true,
    });
  }

  private async pause() {
    this.audioController.pause();
    this.setState({
      isPlaying: false,
    });
  }

  render() {
    const { playingVideo } = this.props;
    const { isPlaying, songDuration, volume, isRandom } = this.state;

    return (
      <div>
        {playingVideo && (
          <div className="flex-horizontal">
            <div className="flex-vertical">
              <div>
                {(isPlaying && <FaPause onClick={() => this.pause()} />) || (
                  <FaPlay onClick={() => this.resume()} />
                )}
                <FaStepForward onClick={() => this.playNextVideo()} />
              </div>
              <div>
                <FaRandom
                  className={isRandom ? 'active-icon' : ''}
                  onClick={() => this.toggleRandom()}
                />
              </div>
            </div>
            <PlaybackControls
              isPlaying={isPlaying}
              currentTimeFn={() => audioController.playbackTime}
              duration={songDuration}
            />
            <VolumeControls
              volume={volume}
              onVolumeChange={(v) => (this.volume = v)}
            />
          </div>
        )}
      </div>
    );
  }
}
