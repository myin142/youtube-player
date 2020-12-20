import React from 'react';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTimeFn: () => number;
  duration: number;
}

export interface PlaybackControlsState {
  interval: NodeJS.Timeout | null;
  update: boolean;
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
    };
  }

  componentDidMount() {
    if (this.state.interval == null) {
      const id = setInterval(() => this.setState({ update: true }), 1000);
      this.setState({ interval: id });
    }
  }

  shouldComponentUpdate() {
    return this.props.isPlaying && this.state.update;
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

  render() {
    const { currentTimeFn, duration } = this.props;
    const time = currentTimeFn();

    return (
      <div>
        <span>
          {this.playbackToMinuteString(time > duration ? duration : time)}
        </span>
        <input type="range" min="0" max={duration} value={time} readOnly />
        <span>{this.playbackToMinuteString(duration)}</span>
      </div>
    );
  }
}
