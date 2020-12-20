import React, { ChangeEvent } from 'react';
import {
  FaVolumeDown,
  FaVolumeMute,
  FaVolumeOff,
  FaVolumeUp,
} from 'react-icons/fa';

export interface VolumeControlsProps {
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export interface VolumeControlsState {
  mutedVolume: number;
  muted: boolean;
}

export class VolumeControls extends React.Component<
  VolumeControlsProps,
  VolumeControlsState
> {
  private static MAX_VOLUME = 100;

  constructor(props: VolumeControlsProps) {
    super(props);
    this.state = {
      muted: false,
      mutedVolume: 0,
    };
  }

  private onVolumeSliderChange({ target }: ChangeEvent<HTMLInputElement>) {
    const volume = parseInt(target.value, 10);
    if (!Number.isNaN(volume)) {
      this.emitNormalizedVolume(volume);
    } else {
      console.warn('Volume not a number');
    }
  }

  private fromNormalizedVolume(vol: number) {
    return vol * VolumeControls.MAX_VOLUME;
  }

  private toNormalizedVolume(vol: number) {
    return vol / VolumeControls.MAX_VOLUME;
  }

  private mute() {
    const { volume, onVolumeChange } = this.props;
    this.setState({
      muted: true,
      mutedVolume: volume,
    });
    onVolumeChange(0);
  }

  private unmute() {
    const { onVolumeChange } = this.props;
    const { mutedVolume } = this.state;

    onVolumeChange(mutedVolume);
    this.setState({
      muted: false,
      mutedVolume: 0,
    });
  }

  private emitNormalizedVolume(vol: number) {
    this.props.onVolumeChange(this.toNormalizedVolume(vol));
  }

  render() {
    const { volume } = this.props;
    const { muted } = this.state;

    let volumeIcon = <FaVolumeUp onClick={() => this.mute()} />;

    if (muted) {
      volumeIcon = <FaVolumeMute onClick={() => this.unmute()} />;
    } else if (volume === 0) {
      volumeIcon = (
        <FaVolumeOff
          onClick={() => this.emitNormalizedVolume(VolumeControls.MAX_VOLUME)}
        />
      );
    } else if (volume < 0.5) {
      volumeIcon = <FaVolumeDown onClick={() => this.mute()} />;
    }

    return (
      <div>
        {volumeIcon}
        <input
          type="range"
          min="0"
          max="100"
          value={this.fromNormalizedVolume(volume)}
          onChange={this.onVolumeSliderChange.bind(this)}
        />
      </div>
    );
  }
}
