import { createStore } from 'redux';
import { videoReducer } from './reducers';

export default createStore(videoReducer);
