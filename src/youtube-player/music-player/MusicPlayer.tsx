import React from 'react';
import { FaPause, FaPlay, FaRandom, FaStepForward } from 'react-icons/fa';
import { connect } from 'react-redux';
import { videoActions, VideoActionType } from '../../redux/actions';
import { PlaylistVideo, YoutubePlayerState } from '../../redux/types';
import { audioController } from '../../services/music-player/audio-controller';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControls } from './VolumeControls';

type MusicPlayerProps = YoutubePlayerState & VideoActionType;

export interface MusicPlayerStats {
  isPlaying: boolean;
  songDuration: number;
  volume: number;
  isRandom: boolean;
}

class MusicPlayer extends React.Component<MusicPlayerProps, MusicPlayerStats> {
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
    const { videoChanged } = this.props;
    if (prevProps.videoChanged !== videoChanged) {
      this.play();
    }
  }

  componentWillUnmount() {
    this.clearListeners();
  }

  private playNextVideo() {
    const vid = this.getNextVideoToPlay();
    if (vid) {
      this.props.playVideo(vid);
    }
  }

  private getNextVideoToPlay(): PlaylistVideo | null {
    const { playingVideos, playingVideo } = this.props;
    const { isRandom } = this.state;

    if (playingVideos.length === 0) return null;

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
    do {
      idx = isRandom ? randomVideoIdx() : nextVideoIdx();
    } while (idx === currentIndex && playingVideos.length > 1);

    return playingVideos[idx];
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

  private playableVideos(): PlaylistVideo[] {
    return (
      this.props.playingPlaylist?.playlist.videos.filter((v) => !v.disabled) ||
      []
    );
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

const mapStateToProps = ({
  playingVideo,
  videoChanged,
  playingPlaylist,
}: YoutubePlayerState): YoutubePlayerState => ({
  playingVideo,
  videoChanged,
  playingPlaylist,
});

export default connect(mapStateToProps, videoActions)(MusicPlayer);
