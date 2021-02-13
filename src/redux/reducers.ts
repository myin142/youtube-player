import { PlaylistActionTypes, PLAY_VIDEO } from './actions';
import { YoutubePlayerState } from './types';

const initialVideoState: YoutubePlayerState = {};

export function videoReducer(
  state = initialVideoState,
  action: PlaylistActionTypes
): YoutubePlayerState {
  switch (action.type) {
    case PLAY_VIDEO:
      return {
        ...state,
        playingVideo: action.payload,
        videoChanged: !state.videoChanged,
      };
    default:
      return state;
  }
}
