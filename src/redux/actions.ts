import { Dispatch } from 'redux';
import { PlaylistVideo } from './types';

export const PLAY_VIDEO = 'PLAY_VIDEO';
export interface PlayVideoAction {
  type: typeof PLAY_VIDEO;
  payload: PlaylistVideo;
}

export type PlaylistActionTypes = PlayVideoAction;

export const videoActions = (dispatch: Dispatch) => ({
  playVideo: (v: PlaylistVideo) => dispatch({ type: PLAY_VIDEO, payload: v }),
});

export type VideoActionType = {
  playVideo: (v: PlaylistVideo) => void;
};
