import React from 'react';
import FlexBox from '../../components/FlexBox';
import YtSlider from '../../components/YtSlider';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTimeFn: () => number;
  duration: number;
  onSeek: (v: number) => void;
  onSeekEnd: () => void;
}

export interface PlaybackControlsState {
  interval: NodeJS.Timeout | null;
  update: boolean;
  seeking: boolean;
}

export class PlaybackControls extends React.Component<
  PlaybackControlsProps,
  PlaybackControlsState
> {
  constructor(props: PlaybackControlsProps) {
    super(props);
    this.state = {
      interval: null,
      update: false,
      seeking: false,
    };
  }

  componentDidMount() {
    if (this.state.interval == null) {
      // TODO: find better way, currently it updates everytime?
      const id = setInterval(() => this.setState({ update: true }), 1000);
      this.setState({ interval: id });
    }
  }

  shouldComponentUpdate() {
    return (this.props.isPlaying || this.state.seeking) && this.state.update;
  }

  componentWillUnmount() {
    if (this.state.interval != null) {
      clearInterval(this.state.interval);
    }
  }

  private playbackToMinuteString(playback: number): string {
    const minutes = Math.max(0, playback / 60);
    const fullMinute = Math.floor(minutes);
    const remainderMinute = minutes - fullMinute;
    const seconds = Math.trunc(remainderMinute * 60);
    return `${this.withPrefixedZero(fullMinute)}:${this.withPrefixedZero(
      seconds
    )}`;
  }

  private withPrefixedZero(num: number): string {
    return (num < 10 ? `0` : '') + num;
  }

  private seek(value: number | number[]) {
    if (Array.isArray(value)) {
      console.log('Cannot seek an array');
    } else {
      this.setState({ seeking: true });
      this.props.onSeek(value);
    }
  }

  private seekEnd() {
    this.setState({ seeking: false });
    this.props.onSeekEnd();
  }

  render() {
    const { currentTimeFn, duration } = this.props;
    const time = currentTimeFn();

    return (
      <FlexBox flexDirection="row">
        <span>
          {this.playbackToMinuteString(time > duration ? duration : time)}
        </span>
        <YtSlider
          min={0}
          max={duration}
          value={time}
          onChange={(e, v) => this.seek(v)}
          onMouseUp={() => this.seekEnd()}
        />
        <span>{this.playbackToMinuteString(duration)}</span>
      </FlexBox>
    );
  }
}
