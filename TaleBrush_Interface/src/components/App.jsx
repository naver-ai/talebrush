// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';
import { Link } from 'react-router-dom';


export default class AppWrapper extends React.Component {
  render() {
    return (
      <div className='app-container' style={{height:'100%'}}>
        {/* <Link to={'/'}>Home</Link>
        <Link to={'/talebrush'}>About</Link> */}
        {this.props.children}
      </div>
    )
  }
}