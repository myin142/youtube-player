import React from 'react';

interface VideoItemProps {
  name: string;
  thumbnail: string;
}

export default function VideoItem({ name, thumbnail }: VideoItemProps) {
  return (
    <span>
      {thumbnail && (
        <img src={thumbnail} width="64px" alt={`${name} thumbnail`} />
      )}
      {name}
    </span>
  );
}
