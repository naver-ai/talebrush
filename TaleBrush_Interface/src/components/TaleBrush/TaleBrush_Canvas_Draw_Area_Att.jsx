// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';

export default class TaleBrush_Canvas_Draw_Area_Att extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timer_function: undefined,
    };
  }

  AttrDrawBegin(e){
      // console.log(this.props.val['_id'])
      // console.log(e.pageX-document.getElementById('drawer_'+this.props.val['_id']).offsetLeft)
      // console.log(document.getElementById('drawer_'+this.props.val['_id']).getBoundingClientRect().top)
      // console.log(e.pageY-document.getElementById('drawer_'+this.props.val['_id']).getBoundingClientRect().top)
      e.stopPropagation();
      if(this.props.mother_state.mode_state=='idle'){
        var x = (e.pageX-document.getElementById('drawer_attr').getBoundingClientRect().left)/document.getElementById('drawer_attr').offsetWidth
        var y = 1-(e.pageY-document.getElementById('drawer_attr').getBoundingClientRect().top)/document.getElementById('drawer_attr').offsetHeight
        var _this = this
        var timer_function = setInterval(function(){
          _this.props.mother_state.attr_draw_pos.push(_this.props.mother_state.attr_draw_mouse_pos.slice(0))
          _this.props.mother_this.setState({attr_total_time: _this.props.mother_state.attr_total_time+100})
        }, 20)
        this.setState({timer_function})
        this.props.mother_this.setState({mode_state: 'attr_draw', attr_draw_pos: [[x, y]], attr_draw_mouse_pos: [x,y]})
      }
  }

  AttrDraw(e){
    e.stopPropagation();
    if(this.props.mother_state.mode_state=='attr_draw'){
      var x = (e.pageX-document.getElementById('drawer_attr').getBoundingClientRect().left)/document.getElementById('drawer_attr').offsetWidth
      var y = 1-(e.pageY-document.getElementById('drawer_attr').getBoundingClientRect().top)/document.getElementById('drawer_attr').offsetHeight

      this.props.mother_this.setState({attr_draw_mouse_pos: [x, y]})
    }
  }

  AttrDrawEnd(e){
      if(this.props.mother_state.mode_state=='attr_draw'){
          clearInterval(this.state.timer_function)
          // console.log(this.props.mother_state.attr_draw_pos, this.props.mother_state.attr_total_time)

          var attr_draw_pos = this.props.mother_state.attr_draw_pos
          var attr_total_time = this.props.mother_state.attr_total_time

          var controls = this.props.mother_state.controls
          var charx = this.props.mother_state.characters[this.props.mother_state.x_axis]
          var chary = this.props.mother_state.characters[this.props.mother_state.y_axis]

          var sentence_len = this.props.mother_state.total_length - this.props.mother_state.text_prompt_range - 1 
          console.log(sentence_len)
          for(var i=0; i<sentence_len; i++){
            var key = Math.round(i/sentence_len*attr_draw_pos.length)
            var pos = attr_draw_pos[key]
            if(controls[charx['_id']]==undefined){
              controls[charx['_id']] = {}
            }
            if(controls[chary['_id']]==undefined){
              controls[chary['_id']] = {}
            }
            controls[charx['_id']][i+this.props.mother_state.text_prompt_range+1] = pos[0]
            controls[chary['_id']][i+this.props.mother_state.text_prompt_range+1] = pos[1]
          }



          this.props.mother_this.setState({mode_state: 'idle', attr_total_time: 0, attr_draw_pos:[]})
      }
  }

  render() {
    return (
        <div id={'drawer_attr'} className='canvas' style={{backgroundColor:'transparent'}} 
        onPointerDown={this.AttrDrawBegin.bind(this)} onPointerMove={this.AttrDraw.bind(this)} onPointerUp={this.AttrDrawEnd.bind(this)}>

        </div>
    )
  }
}