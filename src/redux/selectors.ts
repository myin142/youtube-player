import { PlaylistState } from './playlist/types';

export const getPlaylistFolder = (store: PlaylistState) => store.playlistFolder;
export const getPlaylist = (store: PlaylistState) => store.playlist;
