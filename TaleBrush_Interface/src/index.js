// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store, history } from './store';
import { routes } from './routes';
import { ConnectedRouter } from 'connected-react-router';
import './assets/styles/style';
import 'materialize-css/dist/css/materialize.css'
// import {RoughPainter} from './assets/styles/rough'

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      {routes}
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);