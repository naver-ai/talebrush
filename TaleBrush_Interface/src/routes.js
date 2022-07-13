// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import App from './components/App';
import Home from './components/Home';
import TaleBrush from './components/TaleBrush/TaleBrush'
import TaleBrush_Baseline from './components/TaleBrush/TaleBrush_baseline'

const routes = (
  <App>
    <Switch>
      <Route exact path='/' component={Home} />
      <Route path='/talebrush' component={TaleBrush} />
      <Route path='/talebrush_baseline' component={TaleBrush_Baseline} />
    </Switch>
  </App>
)

export { routes };