/* eslint-disable no-return-assign */
import React, { RefObject } from 'react';
import { Pause, PlayArrow, SkipNext, Shuffle } from '@material-ui/icons';
import { Divider, IconButton } from '@material-ui/core';
import ReactHowler from 'react-howler';
import { clamp } from 'lodash';
import FlexBox from '../../components/FlexBox';
import { PlaylistVideo } from '../types';
import { MusicQueue } from './music-queue';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControls } from './VolumeControls';
import IconToggle from '../../components/IconToggle';

export interface MusicPlayerProps {
  queue: number[];
  videoChanged: boolean;
  playingVideos: PlaylistVideo[];
  playingVideo: PlaylistVideo | null;
  onVideoPlay: (v: PlaylistVideo) => void;
  onQueueChanged: (queue: number[]) => void;
  dirtyQueue: boolean;
}

export interface MusicPlayerStats {
  isPlaying: boolean;
  songDuration: number;
  volume: number;
  isRandom: boolean;
  wasPlaying: boolean;
}

export class MusicPlayer extends React.Component<
  MusicPlayerProps,
  MusicPlayerStats
> {
  private static VOLUME_STEPS = 0.1;

  private readonly player: RefObject<ReactHowler>;

  constructor(props: MusicPlayerProps) {
    super(props);

    this.player = React.createRef();

    this.state = {
      isPlaying: false,
      songDuration: 0,
      volume: 0.5,
      isRandom: true,
      wasPlaying: false,
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    this.clearListeners();
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate(prevProps: MusicPlayerProps) {
    const { videoChanged, playingVideos, dirtyQueue } = this.props;
    if (
      playingVideos.length !== prevProps.playingVideos.length ||
      prevProps.dirtyQueue !== dirtyQueue
    ) {
      this.fillQueue([]);
    }

    if (prevProps.videoChanged !== videoChanged) {
      this.play();
    }
  }

  componentWillUnmount() {
    this.clearListeners();
  }

  private get currentIndex(): number {
    const { playingVideo, playingVideos } = this.props;
    const currentIndex = playingVideos.findIndex(
      (v) => v.id === playingVideo?.id
    );

    return currentIndex;
  }

  private fillQueue(queue: number[] = [], random = this.state.isRandom) {
    const { onQueueChanged, playingVideos } = this.props;

    const currentQueue = [...queue];
    if (this.currentIndex !== -1) {
      currentQueue.unshift(this.currentIndex);
    }

    const maxQueue = 10;

    // TODO: use music queue globally
    const mQueue = new MusicQueue(
      {
        // Current workaround to prevent playing same video twice in a row
        max_queue:
          playingVideos.length < maxQueue ? playingVideos.length : maxQueue,
        max_index: playingVideos.length,
        random,
      },
      currentQueue
    );

    const resultQueue = [...mQueue.queue];
    if (this.currentIndex !== -1) {
      resultQueue.shift();
    }

    onQueueChanged(resultQueue);
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
    this.setState({ volume: clamp(vol, 0, 1) });
  }

  private handleKeyDown(ev: KeyboardEvent) {
    const preventEvent = ['INPUT'];
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
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private toggleRandom() {
    const { isRandom } = this.state;
    this.setState({ isRandom: !isRandom });
    this.fillQueue([], !isRandom);
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
    if (video && video.fileName) {
      this.player.current?.seek(0);
      this.setState({
        isPlaying: true,
      });
    } else {
      console.warn('Cannot play not downloaded video');
    }
  }

  private async resume() {
    this.setState({
      isPlaying: true,
    });
  }

  private async pause() {
    this.setState({
      isPlaying: false,
    });
  }

  private setSongDuration() {
    this.setState({ songDuration: this.player.current?.duration() || 0 });
  }

  private seek(value: number) {
    const wasPlaying = this.state.isPlaying;
    if (wasPlaying) {
      this.setState({ isPlaying: false, wasPlaying: true });
    }
    this.player.current?.seek(value);
  }

  private onSeekEnd() {
    if (this.state.wasPlaying) {
      this.resume();
    }
  }

  render() {
    const { playingVideo } = this.props;
    const { isPlaying, songDuration, volume, isRandom } = this.state;

    return (
      <FlexBox
        flexDirection="row"
        flexGrow={1}
        style={{ gap: '3em' }}
        paddingX="2em"
      >
        {playingVideo && playingVideo.fileName && (
          <ReactHowler
            src={playingVideo.fileName}
            volume={volume}
            playing={isPlaying}
            onLoad={() => this.setSongDuration()}
            onEnd={() => this.playNextVideo()}
            ref={this.player}
          />
        )}
        <div className="controls flex-vertical">
          <FlexBox>
            {(isPlaying && (
              <IconButton onClick={() => this.pause()}>
                <Pause />
              </IconButton>
            )) || (
              <IconButton onClick={() => this.resume()}>
                <PlayArrow />
              </IconButton>
            )}
            <IconButton onClick={() => this.playNextVideo()}>
              <SkipNext />
            </IconButton>

            <Divider orientation="vertical" flexItem />
            <IconToggle
              active={isRandom}
              onClick={() => this.toggleRandom()}
              title="Shuffle"
            >
              <Shuffle />
            </IconToggle>
          </FlexBox>
        </div>
        <div className="playback flex-vertical">
          <PlaybackControls
            isPlaying={isPlaying}
            currentTimeFn={() => this.player.current?.seek() || 0}
            duration={songDuration}
            onSeek={(v) => this.seek(v)}
            onSeekEnd={() => this.onSeekEnd()}
          />
        </div>
        <div className="other-controls flex-vertical">
          <VolumeControls
            volume={volume}
            onVolumeChange={(v) => (this.volume = v)}
          />
        </div>
      </FlexBox>
    );
  }
}
