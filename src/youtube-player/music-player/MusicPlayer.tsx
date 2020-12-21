import React from 'react';
import { FaPause, FaPlay, FaRandom, FaUndo } from 'react-icons/fa';
import { PlaylistVideo } from '../../redux/playlist/types';
import { audioController } from '../../services/music-player/audio-controller';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControls } from './VolumeControls';

export interface MusicPlayerProps {
  playingVideos: PlaylistVideo[];
  playingVideo: PlaylistVideo | null;
  onVideoPlay: (v: PlaylistVideo) => void;
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
  private readonly audioController = audioController;

  constructor(props: MusicPlayerProps) {
    super(props);
    this.state = {
      isPlaying: this.audioController.isPlaying,
      songDuration: this.audioController.songDuration,
      volume: this.audioController.volume,
      isRandom: true,
    };
  }

  componentDidMount() {
    this.audioController.addListener('songFinished', () => {
      this.props.onVideoPlay(this.getNextVideoToPlay());
    });
  }

  componentDidUpdate(prevProps: MusicPlayerProps) {
    const { playingVideo } = this.props;
    if (prevProps.playingVideo?.id !== playingVideo?.id) {
      this.play();
    }
  }

  componentWillUnmount() {
    // Right now this class should be the only listener
    this.audioController.removeAllListeners('songFinished');
  }

  private getNextVideoToPlay(): PlaylistVideo {
    const { playingVideos, playingVideo } = this.props;
    const { isRandom } = this.state;

    const currentIndex = playingVideos.findIndex(
      (v) => v.id === playingVideo?.id
    );
    const randomVideoIdx = () =>
      Math.floor(Math.random() * playingVideos.length);
    const nextVideoIdx = () => {
      let idx = currentIndex + 1;
      if (idx >= playingVideos.length) {
        idx = 0;
      }
      return idx;
    };

    let idx = currentIndex;
    while (idx === currentIndex) {
      idx = isRandom ? randomVideoIdx() : nextVideoIdx();
    }
    return playingVideos[idx];
  }

  private setVolume(volume: number): void {
    this.audioController.volume = volume;
    this.setState({ volume });
  }

  private toggleRandom() {
    const { isRandom } = this.state;
    this.setState({ isRandom: !isRandom });
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
              onVolumeChange={(v) => this.setVolume(v)}
            />
          </div>
        )}
      </div>
    );
  }
}
