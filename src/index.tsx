import { Provider } from 'react-redux';
import React from 'react';
import { render } from 'react-dom';
import App from './App';
import './App.global.css';
import store from './redux/store';

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
