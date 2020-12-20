import React from 'react';
import { PlaylistVideo } from '../redux/playlist/types';

interface PlaylistQueueProps {
  playingVideo: PlaylistVideo;
  nextQueue: PlaylistVideo[];
}

export default function PlaylistQueue({
  playingVideo,
  nextQueue,
}: PlaylistQueueProps) {
  const queueItems = nextQueue.map((v, i) => {
    // eslint-disable-next-line react/no-array-index-key
    return <li key={i}>{v.title}</li>;
  });

  return (
    <div>
      {playingVideo && (
        <div>
          <h2>Currently playing</h2>
          <span>{playingVideo.title}</span>
        </div>
      )}
      {queueItems.length > 0 && (
        <div>
          <h2>Next in queue</h2>
          <ul>{queueItems}</ul>
        </div>
      )}
    </div>
  );
}
