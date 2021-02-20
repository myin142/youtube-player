import React from 'react';
import {
  VolumeDown,
  VolumeMute,
  VolumeOff,
  VolumeUp,
} from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import FlexBox from '../../components/FlexBox';
import YtSlider from '../../components/YtSlider';

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

  private onVolumeSliderChange(volume: number | number[]) {
    // const volume = parseInt(newValue, 10);
    if (!Array.isArray(volume)) {
      this.emitNormalizedVolume(volume);
    } else {
      console.warn('Volume not a number', volume);
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

    let volumeIcon = (
      <IconButton onClick={() => this.mute()}>
        <VolumeUp />
      </IconButton>
    );

    if (muted) {
      volumeIcon = (
        <IconButton onClick={() => this.unmute()}>
          <VolumeMute />
        </IconButton>
      );
    } else if (volume === 0) {
      volumeIcon = (
        <IconButton
          onClick={() => this.emitNormalizedVolume(VolumeControls.MAX_VOLUME)}
        >
          <VolumeOff />
        </IconButton>
      );
    } else if (volume < 0.5) {
      volumeIcon = (
        <IconButton onClick={() => this.mute()}>
          <VolumeDown />
        </IconButton>
      );
    }

    return (
      <FlexBox flexDirection="row">
        {volumeIcon}
        <YtSlider
          value={this.fromNormalizedVolume(volume)}
          min={0}
          max={100}
          onChange={(e, v) => this.onVolumeSliderChange(v)}
        />
      </FlexBox>
    );
  }
}
