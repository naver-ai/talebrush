// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import { combineReducers } from 'redux';
import itemReducer from './itemReducer';
import { connectRouter } from 'connected-react-router';

export const rootReducer = history => combineReducers({
  items: itemReducer,
  router: connectRouter(history),
});