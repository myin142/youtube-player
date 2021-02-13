import React from 'react';
import { connect } from 'react-redux';
import { PlaylistVideo, YoutubePlayerState } from '../redux/types';

type PlaylistQueueProps = YoutubePlayerState & {
  nextQueue: PlaylistVideo[];
};

function PlaylistQueue({ playingVideo, nextQueue }: PlaylistQueueProps) {
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

const mapStateToProps = ({
  playingVideo,
}: YoutubePlayerState): YoutubePlayerState => ({ playingVideo });

export default connect(mapStateToProps)(PlaylistQueue);
