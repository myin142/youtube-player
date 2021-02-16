import React from 'react';
import { PlaylistVideo } from '../redux/playlist/types';

interface PlaylistQueueProps {
  playingVideo: PlaylistVideo;
  videos: PlaylistVideo[];
  queue: number[];
}

export default function PlaylistQueue({
  playingVideo,
  queue: nextQueue,
  videos,
}: PlaylistQueueProps) {
  const queueItems = nextQueue
    .filter((i) => i >= 0 && i < videos.length)
    .map((v, i) => {
      // eslint-disable-next-line react/no-array-index-key
      return <li key={i}>{videos[v].title}</li>;
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
