// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';

export default class TaleBrush_Canvas_SenVis_Att extends React.Component {

  renderDraw(){
    if(this.props.mother_state.attr_draw_pos!=undefined){
      return this.props.mother_state.attr_draw_pos.map((val, idx)=>{
        var x = (val[0]*100)+'%'
        var y = ((1-val[1])*100)+'%'
        return <circle cx={x} cy={y} r="5" strokeWidth='0' fill="#ffaaff20"></circle>
      })
    }
    
  }

  renderControls(char1, char2){
    var x_controls = this.props.mother_state.controls[char1['_id']]
    var y_controls = this.props.mother_state.controls[char2['_id']]
    var controls_keys
    if(x_controls!=undefined && y_controls!=undefined){
      var x_controls_keys = Object.keys(x_controls)
      var y_controls_keys = Object.keys(y_controls)

      controls_keys = x_controls_keys.concat(y_controls_keys)

      controls_keys.filter((item, pos)=> controls_keys.indexOf(item)===pos)

    }else if(x_controls!=undefined){
      controls_keys = Object.keys(x_controls)
      
      y_controls={}
    }else if(y_controls!=undefined){
      controls_keys = Object.keys(y_controls)

      x_controls={}
    }else{
      controls_keys=[]
    }

    return controls_keys.map((key, idx)=>{
      if(parseInt(key)<=this.props.mother_state.text_front_prompt_end && parseInt(key)>=this.props.mother_state.text_front_prompt_start){
        return
      }
      if(parseInt(key)<=this.props.mother_state.text_back_prompt_end && parseInt(key)>=this.props.mother_state.text_back_prompt_start && this.props.mother_state.text_back_prompt_end!=-1){
        return
      }
      var x_val = x_controls[key]
      var y_val = y_controls[key]
      var x, y, color;
      if(x_val==undefined){
        x = '50%'
        y = 'calc('+(1-y_val)*100+'% - 10px)' 
        color = '#ff8888'
      }else if(y_val==undefined){
        x = x_val*100+'%'
        y='50%'
        color = '#8888ff'
      }else{
        x = 'calc('+x_val*100+'% - 10px)'
        y = 'calc('+(1-y_val)*100+'% - 10px)'
        color = '#ff88ff'
      }
      return (<div className='sentence_dot' style={{border: 'solid 2px transparent', width: '10px', height:'10px', left: x, top: y, backgroundColor: color}}></div>)
    })

    
  }

  renderControlArrows(char1, char2){
    var x_controls = this.props.mother_state.controls[char1['_id']]
    var y_controls = this.props.mother_state.controls[char2['_id']]
    var controls_keys
    if(x_controls!=undefined && y_controls!=undefined){
      var x_controls_keys = Object.keys(x_controls)
      var y_controls_keys = Object.keys(y_controls)

      controls_keys = x_controls_keys.concat(y_controls_keys)

      controls_keys = controls_keys.filter((item, pos)=> controls_keys.indexOf(item)===pos)

    }else if(x_controls!=undefined){
      controls_keys = Object.keys(x_controls)
      
      y_controls={}
    }else if(y_controls!=undefined){
      controls_keys = Object.keys(y_controls)

      x_controls={}
    }else{
      controls_keys=[]
    }
    // console.log(controls_keys, this.props.mother_state.)
    controls_keys = controls_keys.filter((item, pos)=> parseInt(item) <= this.props.mother_state.text_front_prompt_end && parseInt(item) >= this.props.mother_state.text_front_prompt_start)
    if(this.props.mother_state.text_back_prompt_end!=-1){
      controls_keys = controls_keys.filter((item, pos)=> parseInt(item) <= this.props.mother_state.text_back_prompt_end && parseInt(item) >= this.props.mother_state.text_back_prompt_start)
    }
    
    controls_keys.sort()
    console.log(controls_keys)

    return controls_keys.map((key, idx)=>{
      // console.log(idx+1, controls_keys.length)
      // if(idx+1<controls_keys.length){
        // console.log(key)
        
        var valpre1, valpre2
        if(idx!=0){
          valpre1 = x_controls[parseInt(key)-1]
          valpre2 = y_controls[parseInt(key)-1]
        }else{
          if(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][parseInt(key)-1]!=undefined){
            valpre1 = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][parseInt(key)-1][char1['_id']]
            valpre2 = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][parseInt(key)-1][char2['_id']]
          }else{
            return 
          }
          
        }
        
        var valpost1 = x_controls[parseInt(key)]
        var valpost2 = y_controls[parseInt(key)]

        var x1 = valpre1*100+'%'
        var y1 = (1-valpre2)*100+'%'

        var x2 = valpost1*100+'%'
        var y2 = (1-valpost2)*100+'%'

        return (<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f8f" 
        strokeWidth="2" markerEnd="url(#arrowhead2)"></line>)
      // }
      
    })
  }

  renderArrows(char1, char2){
    var text_parsed = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id]
    return text_parsed.map((val, idx)=>{
      if(idx+1<text_parsed.length){
        var valpre1 = val[char1._id]
        var valpre2 = val[char2._id]
        var valpost1 = text_parsed[idx+1][char1._id]
        var valpost2 = text_parsed[idx+1][char2._id]

        var x1 = valpre1*100+'%'
        var y1 = (1-valpre2)*100+'%'

        var x2 = valpost1*100+'%'
        var y2 = (1-valpost2)*100+'%'

        return (<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#aaa" 
        strokeWidth="4" markerEnd="url(#arrowhead)"></line>)
      }
      
    })
  }

  renderSentences(char1, char2){
    return this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id].map((val, idx)=>{
      var backgroundColor='#eeeeee'
      if(idx <= this.props.mother_state.text_front_prompt_end && idx >= this.props.mother_state.text_front_prompt_start){
        backgroundColor = '#333333'
      }
      if(idx <= this.props.mother_state.text_back_prompt_end && idx >= this.props.mother_state.text_back_prompt_start && this.props.mother_state.text_back_prompt_start==-1){
        backgroundColor = '#333333'
      }


      var val1 = val[char1._id]
      var val2 = val[char2._id]
      var seq = idx
      var total_length = this.props.mother_state.total_length

      var x = 'calc('+val1*100+'% - 5px)'
      var y = 'calc('+(1-val2)*100+'% - 5px)'
      return (<div className='sentence_dot' style={{left: x, top: y, backgroundColor: 'rgb(84, 160, 248)'}}></div>)

    })
  }

  render() {
    var char1 = this.props.mother_state.characters[this.props.mother_state.x_axis]
    var char2 = this.props.mother_state.characters[this.props.mother_state.y_axis]

    return (
        <div style={{backgroundColor: 'transparent', overflow:'hidden'}} className='canvas'>
          <svg id='arrow_svg' style={{width: '100%', height: '100%'}}>
            <defs>
              <marker id="arrowhead" markerWidth="5" markerHeight="3.5" 
              refX="7" refY="1.75" orient="auto" fill='#aaa'>
                <polygon points="0 0, 5 1.75, 0 3.5" />
              </marker>
              <marker id="arrowhead2" markerWidth="5" markerHeight="3.5" 
              refX="7" refY="1.75" orient="auto" fill='#f8f'>
                <polygon points="0 0, 5 1.75, 0 3.5" />
              </marker>
            </defs>
            {this.props.mother_state.mode_state=='attr_draw'&& this.renderDraw()}
            {this.renderArrows(char1, char2)}
            {this.renderControlArrows(char1, char2)}
            {this.renderDraw()}
          </svg>
          {this.renderControls(char1, char2)}
          {this.renderSentences(char1, char2)}        
        </div>
    )
  }
}