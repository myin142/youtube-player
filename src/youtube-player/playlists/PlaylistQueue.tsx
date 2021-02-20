import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { PlaylistVideo } from '../../redux/playlist/types';

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
    .map((v) => {
      return (
        <>
          <ListItem key={videos[v].id}>
            <ListItemText>{videos[v].title}</ListItemText>
          </ListItem>
          <Divider component="li" />
        </>
      );
    });

  return (
    <div className="flex-vertical" style={{ gap: '1em' }}>
      {playingVideo && (
        <div>
          <Typography variant="h5" gutterBottom>
            Currently playing
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText>{playingVideo.title}</ListItemText>
            </ListItem>
          </List>
        </div>
      )}
      {queueItems.length > 0 && (
        <div>
          <Typography variant="h5" gutterBottom>
            Next in queue
          </Typography>
          <List dense>{queueItems}</List>
        </div>
      )}
    </div>
  );
}
