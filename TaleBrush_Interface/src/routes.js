// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import App from './components/App';
import Home from './components/Home';
import TaleBrush from './components/TaleBrush/TaleBrush'

const routes = (
  <App>
    <Switch>
      <Route exact path='/' component={Home} />
      <Route path='/talebrush' component={TaleBrush} />
    </Switch>
  </App>
)

export { routes };