import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { PlaylistVideo } from '../types';

interface PlaylistQueueProps {
  playingVideo: PlaylistVideo;
  videos: PlaylistVideo[];
  queue: number[];
}

export default function PlaylistQueue({
  playingVideo,
  queue,
  videos,
}: PlaylistQueueProps) {
  const currentIndex = videos.findIndex((v) => v.id === playingVideo.id);

  const nextQueue = [...queue];
  if (currentIndex !== -1) {
    nextQueue.unshift(currentIndex);
  }

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
