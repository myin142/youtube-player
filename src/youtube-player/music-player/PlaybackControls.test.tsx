import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { PlaybackControls } from './PlaybackControls';

describe('PlaybackControls', () => {
  it('should show playback time', () => {
    const elem = render(
      <PlaybackControls
        duration={280}
        isPlaying={false}
        currentTimeFn={() => 0}
      />
    );

    expect(elem.baseElement.textContent).toContain('04:40');
  });

  it('should show small playback time', () => {
    const elem = render(
      <PlaybackControls
        duration={30}
        isPlaying={false}
        currentTimeFn={() => 0}
      />
    );

    expect(elem.baseElement.textContent).toContain('00:30');
  });

  it('should not show display past max duration', () => {
    const elem = render(
      <PlaybackControls
        duration={30}
        isPlaying={false}
        currentTimeFn={() => 40}
      />
    );

    expect(elem.baseElement.textContent).not.toContain('00:40');
  });

  it('should not show negative time', () => {
    const elem = render(
      <PlaybackControls
        duration={-1}
        isPlaying={false}
        currentTimeFn={() => 40}
      />
    );

    expect(elem.baseElement.textContent).not.toContain('-1');
  });
});
