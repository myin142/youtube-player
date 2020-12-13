import React from 'react';
import { LibraryFolderInfo } from '../../services/library.service';

interface LibraryBrowserProps {
  folderInfos: LibraryFolderInfo[];
  onFolderSelect: (info: LibraryFolderInfo) => void;
}

const LibraryBrowser = ({
  folderInfos,
  onFolderSelect,
}: LibraryBrowserProps) => {
  const folderStructure = folderInfos.map((info) => {
    return (
      <li key={info.name}>
        <button
          type="button"
          onClick={() => onFolderSelect(info)}
          onKeyPress={() => onFolderSelect(info)}
        >
          {info.name}: {info.playlistInfo?.playlistId || 'Not a playlist'}
        </button>
      </li>
    );
  });

  return <ul>{folderStructure}</ul>;
};

export default LibraryBrowser;
