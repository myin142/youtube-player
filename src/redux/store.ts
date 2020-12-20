import { createStore } from 'redux';
import { playlistReducer } from './playlist/reducer';

export default createStore(playlistReducer);
