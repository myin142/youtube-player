import React from 'react';
import { connect } from 'react-redux';
import { YoutubePlayerState } from '../redux/types';
import { YoutubeService } from '../services/youtube.service';

type ThumbnailProps = YoutubePlayerState & { youtubeService: YoutubeService };

function Thumbnail({ playingVideo, youtubeService }: ThumbnailProps) {
  return (
    (playingVideo && (
      <img
        src={youtubeService.getThumbnail(playingVideo.id)}
        alt="Playing Video Thumbnail"
        className="fit"
      />
    )) || <div />
  );
}

const mapStateToProps = ({
  playingVideo,
}: YoutubePlayerState): YoutubePlayerState => ({
  playingVideo,
});

export default connect(mapStateToProps)(Thumbnail);
