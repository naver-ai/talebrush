// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

let config = {
  api: {
    protocol: 'http',
    host: 'localhost',
    port: 7082,
    prefix: 'api'
  },
};

config.endpoint = config.api.protocol + '://' +
  config.api.host + ':' +
  config.api.port + '/' +
  config.api.prefix + '/';

module.exports = config;