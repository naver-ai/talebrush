// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import axios from 'axios';
import React from 'react';
import TaleBrush_Canvas from './TaleBrush_Canvas';
import TaleBrush_TextBox from './TaleBrush_TextBox';
import {continuing_generation, infilling_generation} from './TaleBrush_Generate'
import cursor_b from '../../img/cursor_b.png'
import cursor_e from '../../img/cursor_e.png'

export default class TaleBrush extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode_state: 'idle', // idle, choose_x_axis, choose_y_axis, 
      action_state: 'brush', // 
      seq_draw_char: '',

      generation_mode: 'continuation', 

      // draw_mode: 'sinlge', // single - multiple  
      // // -- single for single attribute line that can be drawn in multiple strokes  
      // // -- multiple for multiple attribute expressed position + duration

      seq_draw_prev_pos: undefined,

      attr_total_time: 0,
      
      x_axis: -1, // -1 for sequence, 0 for characters
      y_axis: 0,

      x_axis_color: '#000088',
      y_axis_color: '#880000',

      characters: [{_id:'protagonist', name:''}],
      total_length: 8, 

      text: '>\n>\n>\n>\n>\n>\n>\n>',
      sentences: [],
      text_parsed: {'0': new Array(30).fill({'sentence':''})},
      cur_path_id: '0',
      generated_names: {},
      // text_prompt_range: 0,
      // text_prompt_range_end: -1, 

      text_front_prompt_start: 0,
      text_front_prompt_end: 1,
      text_back_prompt_start: -1, 
      text_back_prompt_end: -1, 
      text_generation_end: 7, 

      controls: {'0':{'protagonist':{}, '_surprise':{}, '_regeneration':{},}},
      control_times: {'protagonist': [], '_surprise':[], '_regeneration': []},
      controls_drawn: {},

      surprise_in_size: false,
      surprise_in_panel: false,

      sent_highlighted: -1, 
      sent_highlighted_mouse: -1, 

      prev_states: [], 
      next_states: [],

      dropdown: false,
      hover_path_id: '',

      being_generated: false, 

      user: 'testing',
      logging: true, 

      added_control_ids: [], 
      original_controls: {},

      video: false,
    };
  }

  // componentDidUpdate(){
  //   var svg = document.getElementById('control_svg')
  //   console.log(rough)
  //   // var roughSvg = rough.svg(svg);
  //   console.log(svg.children)
  //   var childNodes = Array.prototype.slice.call(svg.children)
  //   for(var i in childNodes){
  //     console.log(i)
  //     if(i!=0){
  //       svg.removeChild(childNodes[i])
  //     }
      
  //   }




  // }

  // run after store State, I guess...
  storeEvent(action){
    if(this.state.logging){
      var c_state = JSON.parse(JSON.stringify(this.state))
      delete c_state['prev_states']
      delete c_state['next_states']

      var c_state_to_return = c_state

      axios('/api/storeEvent', {
          method: 'POST',
          data: {
              'c_state': c_state_to_return,
              'user': this.state.user,
              'action': action,
          }
      })
    }
    

  }

  gup( name, url ) {
      if (!url) url = location.href;
      name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
      var regexS = "[\\?&]"+name+"=([^&#]*)";
      var regex = new RegExp( regexS );
      var results = regex.exec( url );
      return results == null ? null : results[1];
  }

  setAllStates(new_state, action){
    var _this = this
    for(var key in this.state){
        this.state[key] = new_state[key]
    }
    if(this.state['surprise_in_panel']){
      document.getElementById('surprise_check_panel').checked = true
    }else{
      document.getElementById('surprise_check_panel').checked = false
    }
    if(this.state['surprise_in_size']){
      document.getElementById('surprise_check_size').checked = true
    }else{
      document.getElementById('surprise_check_size').checked = false
    }
    if(this.state['action_state']=='brush'){
      document.getElementById('TB_canvas').style.cursor = 
                'url('+cursor_b+'), auto'
    }else{
      document.getElementById('TB_canvas').style.cursor = 
                'url('+cursor_e+'), auto'
    }
    this.state.sent_highlighted = -1
    this.state.sent_highlighted_mouse = -1
    this.state.dropdown=false
    this.state.mode_state='idle'
    this.state.being_generated=false
    this.setState({}, function(){
      _this.highlightSentence(_this.state.text, _this.state.text_parsed[_this.state.cur_path_id])
      _this.storeEvent(action)
    })
  }

  storeState(action = ''){
    var c_state = JSON.parse(JSON.stringify(this.state))
    delete c_state['prev_states']
    delete c_state['next_states']
    this.state.prev_states.push(c_state)
    if(this.state.prev_states.length>20){

    }
    var _this = this
    this.setState({next_states: []}, function(){
      _this.storeEvent(action)
    })  
  }

  undoState(){
    if(this.state.prev_states.length>1){
      console.log('undo trying')
      this.state.prev_states.pop()
      var prev_states = JSON.parse(JSON.stringify(this.state.prev_states))
      var cur_state = JSON.parse(JSON.stringify(this.state.prev_states.pop()))
      var n_state = JSON.parse(JSON.stringify(this.state))
      delete n_state['prev_states']
      delete n_state['next_states']
      this.state.next_states.push(n_state)
      cur_state['prev_states'] = prev_states
      cur_state['next_states'] = this.state.next_states
      console.log(cur_state)
      this.setAllStates(cur_state, 'undo')
      // this.state=cur_state
      // this.setState({})  
    }
    
  }

  redoState(){
    console.log(this.state.next_states.length)
    if(this.state.next_states.length>0){
      console.log('redo trying')
      // this.state.next_states.pop()
      // var next_states = JSON.parse(JSON.stringify(this.state.next_states))
      var cur_state = JSON.parse(JSON.stringify(this.state.next_states.pop()))
      var p_state = JSON.parse(JSON.stringify(cur_state))
      // delete p_state['prev_states']
      // delete p_state['next_states']
      this.state.prev_states.push(p_state)
      cur_state['prev_states'] = JSON.parse(JSON.stringify(this.state.prev_states))
      cur_state['next_states'] = JSON.parse(JSON.stringify(this.state.next_states))
      this.setAllStates(cur_state, 'redo')
    }
  }
  

  
  componentDidMount(){
    
    var text_parsed = {'0': []}
    for(var i=0; i<8; i++){
      text_parsed['0'][i] = {'sentence':''}
    }
    // TODO enable below.
    var char_name = ''
    // var char_name = prompt('Decide the name of the protagonist')
    var _this = this

    var user = this.gup('user')
    if (user==undefined){
      user= 'testing'
    }
    var logging = this.gup('logging')
    if (logging==undefined){
      logging = false
    }else if(logging =='true'){
      logging = true
    }else if (logging =='false'){
      logging = false
    }else{
      logging = false
    }

    var task=this.gup('task')
    if(task=='edit'){
      char_name='Jack'
      text_parsed['0'][0]={'sentence': "Jack's favorite animal is panda.", 'protagonist': 0.729}
      text_parsed['0'][1]={'sentence': "Therefore, Jack went to a zoo to see pandas.", 'protagonist': 0.6323}
      this.state.text= ">Jack's favorite animal is panda.\n>Therefore, Jack went to a zoo to see pandas.\n>\n>\n>\n>\n>\n>"
    }else if(task=='video'){
      char_name='Emma'
      text_parsed['0'][0]={'sentence': "Emma always wanted to be a famous actress, but lacked talent in acting.", 'protagonist': 0.3477}
      // text_parsed['0'][1]={'sentence': "Therefore, Jack went to a zoo to see pandas.", 'protagonist': 0.6323}
      this.state.text= ">Emma always wanted to be a famous actress, but lacked talent in acting.\n>\n>\n>\n>\n>\n>\n>"
      this.setState({video:true})
    }

    

    this.setState({text_parsed, user, logging, characters: [{_id:'protagonist', name:char_name}]}, function(){
      var init_state = JSON.parse(JSON.stringify(_this.state))
      // _this.state.init_state = init_state
      console.log(init_state)
      _this.state.prev_states.push(init_state)
      _this.highlightSentence(this.state.text, this.state.text_parsed[this.state.cur_path_id])
    })
    
    document.addEventListener('keydown', function(event) {
      if (event.shiftKey && event.metaKey && event.key === 'z') {
        event.preventDefault()
        if(_this.state.being_generated==false){
          _this.redoState()
        }
        
      }
      else if (event.metaKey && event.key === 'z') {
        event.preventDefault()
        if(_this.state.being_generated==false){
          _this.undoState()
        }
        
      }
    });
  }

  statecheck(){
    console.log(this.state)
  }

  AllPointerDown(){
    this.setState({dropdown:false})
  }

  highlightSentence(text, parsed){
    // console.log(text, parsed)
    var innerHTML = text
    var slice_idx = 0
    for(var i in parsed){
      
      // console.log(i)
        var backgroundColor='transparent'
        if(parsed[i]['protagonist']!=undefined){
          var ratio = parsed[i]['protagonist']

          if(ratio > 0.8) {
            backgroundColor = 'rgba(255, 199, 0, 0.1)'
          }
          else if(ratio > 0.6) {
            backgroundColor = 'rgba(229, 202, 109, 0.1)'
          }
          else if(ratio > 0.4) {
            backgroundColor = 'rgba(217, 217, 217, 0.1)'
          }
          else if(ratio > 0.2) {
            backgroundColor = 'rgba(128, 128, 128, 0.1)'
          }
          else {
            backgroundColor = 'rgba(0, 0, 0, 0.1)'
          }

          // var r= parseInt((1-ratio)*255+ratio*182)
          // var g= parseInt((1-ratio)*182+ratio*255)
          // var b= 182
        // console.log(r,g,b)
          // backgroundColor = 'rgba('+r.toString()+', '+g.toString()+', '+b.toString()+', 0.7)'
        }
        // console.log(backgroundColor)
        var single_parsed = parsed[i]['sentence']
        if(single_parsed.replace( /^\s+|\s+$/g, '') ==''){
          single_parsed = '>'+single_parsed
          // continue
        }
        // var reg = new RegExp('(?!>)'+single_parsed+'(?!<)')
        var reg = single_parsed
        // console.log(this.state.sent_highlighted_mouse, parseInt(i))
        if(this.state.sent_highlighted_mouse==parseInt(i)){
          backgroundColor = '#DFEEFF'
        }
        // console.log(reg)
        // if((this.state.generation_mode=='continuation' && i<=this.state.text_front_prompt_end && i>=this.state.text_front_prompt_start) 
        // || (this.state.generation_mode=='infilling' && i<=this.state.text_front_prompt_end && i>=this.state.text_front_prompt_start)
        // || (this.state.generation_mode=='infilling' && i<=this.state.text_back_prompt_end && i>=this.state.text_back_prompt_start)){
        //   var replace = '<span id="span_fill_'+i.toString()+'" style="text-decoration: underline; text-decoration-color: #333333; background-color:'+backgroundColor+'; text-decoration-thickness: 3px;">'+single_parsed+'</span>'
        //   innerHTML = innerHTML.slice(0, slice_idx)+innerHTML.slice(slice_idx).replace(reg, replace)
        //   slice_idx = innerHTML.indexOf(replace) + replace.length
        // }else if((this.state.generation_mode=='continuation' && i>this.state.text_front_prompt_end && i<=this.state.text_generation_end)
        // || (this.state.generation_mode=='infilling' && i>this.state.text_front_prompt_end && i<this.state.text_back_prompt_start)){
        //   var replace = '<span id="span_fill_'+i.toString()+'" style="text-decoration: underline dashed; text-decoration-color: #333333; background-color:'+backgroundColor+'; text-decoration-thickness: 1px;">'+single_parsed+'</span>'
        //   innerHTML = innerHTML.slice(0, slice_idx)+innerHTML.slice(slice_idx).replace(reg, replace)
        //   slice_idx = innerHTML.indexOf(replace) + replace.length
        // }else{
          var replace = '<span id="span_fill_'+i.toString()+'" style="text-decoration:line-through; text-decoration-thickness:30px; text-decoration-color:'+backgroundColor+'">'+single_parsed+'</span>'
          innerHTML = innerHTML.slice(0, slice_idx)+innerHTML.slice(slice_idx).replace(reg, replace)
          slice_idx = innerHTML.indexOf(replace) + replace.length
        // }
        // console.log(single_parsed, innerHTML)
      
    }
    
    innerHTML = innerHTML.replaceAll('\n', '<br/>')
    var regex = /(\<\/span[\w\s]+\>)(\s+)(\<span[\w\s])/ig; 
    innerHTML = innerHTML.replace(regex, "&nbsp;");
    
    // console.log(innerHTML)
    document.getElementById('textarea_prompt').innerHTML = innerHTML
    this.setState({})
  }

  generate(_this){
    // var _this = this
        // this.props.mother_this.storeState('control_drawing')
        _this.props.mother_this.setState({mode_state: 'idle'}, function(){
          _this.props.mother_state.added_control_ids.sort()
          var text_parsed= _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]
          // console.log(text_parsed)
          var min = Math.min(..._this.props.mother_state.added_control_ids)
          var max = Math.max(..._this.props.mother_state.added_control_ids)
          // console.log(min, max)
          var pre_context = []
          var post_context = []
          var pre_gap_count = 0
          var post_gap_count = 0
          if(min==Infinity || max==Infinity){
            return
          }
          for(var i=min-1; i>=0; i--){
            if(text_parsed[i.toString()]==undefined){
              pre_gap_count++
            }else if(text_parsed[i.toString()]['sentence']!=''){
              pre_context.unshift(i)
            }else if(text_parsed[i.toString()]['sentence']=='' && pre_context.length>0){
              break
            }else{
              pre_gap_count++
            }
          }
          for(var i=max+1; i<_this.props.mother_state.total_length; i++){
            if(text_parsed[i.toString()]==undefined){
              post_gap_count++
            }else if(text_parsed[i.toString()]['sentence']!=''){
              post_context.push(i)
            }else if(text_parsed[i.toString()]['sentence']=='' && post_context.length>0){
              break
            }else{
              post_gap_count++
            }
          }
          console.log(pre_context, post_context, pre_gap_count, post_gap_count)
          if(_this.props.val!=undefined){
            if(_this.props.val['_id']=='_surprise'){
              return
            }
          }
          
          if(pre_context.length>0 || post_context.length>0){
            if(pre_context.length>0 && pre_gap_count==0 && post_context.length==0){
              // Continuation
              console.log('continuation')
              continuing_generation(_this, Math.min(...pre_context), Math.max(...pre_context), max)

            }else if(pre_context.length>0 && pre_gap_count>0 && post_context.length==0){
              // Continuation
              console.log('continuation')
              var pick_ids = []
              for(var i = min; i<=max; i++){
                pick_ids.push(i)
              }
              continuing_generation(_this, Math.min(...pre_context), Math.max(...pre_context), max, pick_ids)
            }else if(pre_context.length>=0 && post_context.length>0 && pre_gap_count==0 && post_gap_count==0){
              // Traditional Infill
              console.log('traditional infill')
              var pre_min, pre_max
              if(pre_context.length==0){
                pre_min = 0
                pre_max = -1
              }else{
                pre_min = Math.min(...pre_context)
                pre_max = Math.max(...pre_context)
              }
              infilling_generation(_this, pre_min, pre_max,  Math.min(...post_context), Math.max(...post_context))
            }else if(pre_context.length>=0 && post_context.length>0 && pre_gap_count==0 && post_gap_count>0){
              // Infill from front
              console.log('infill from front')
              var pick_ids = []
              for(var i = min; i<=max; i++){
                pick_ids.push(i)
              }
              var pre_min, pre_max
              if(pre_context.length==0){
                pre_min = 0
                pre_max = -1
              }else{
                pre_min = Math.min(...pre_context)
                pre_max = Math.max(...pre_context)
              }
              console.log(pick_ids)
              infilling_generation(_this, pre_min, pre_max,  Math.min(...post_context), Math.max(...post_context), pick_ids)
            }else if(pre_context.length>=0 && post_context.length>0 && pre_gap_count>0 && post_gap_count==0){
              // Infill from back
              console.log('infill from back')
              var pick_ids = []
              for(var i = min; i<=max; i++){
                pick_ids.push(i)
              }
              var pre_min, pre_max
              if(pre_context.length==0){
                pre_min = 0
                pre_max = -1
              }else{
                pre_min = Math.min(...pre_context)
                pre_max = Math.max(...pre_context)
              }
              infilling_generation(_this, pre_min, pre_max,  Math.min(...post_context), Math.max(...post_context), pick_ids)
            }else if(pre_context.length>=0 && post_context.length>0 && pre_gap_count>0 && post_gap_count>0){
              // Traditional Infill
              console.log('infill in the middle')
              var pick_ids = []
              for(var i = min; i<=max; i++){
                pick_ids.push(i)
              }
              console.log(pick_ids)
              var pre_min, pre_max
              if(pre_context.length==0){
                pre_min = 0
                pre_max = -1
              }else{
                pre_min = Math.min(...pre_context)
                pre_max = Math.max(...pre_context)
              }
              infilling_generation(_this, pre_min, pre_max,  Math.min(...post_context), Math.max(...post_context), pick_ids)
            }

          }else{
            alert('No context is given to generate story!')
            // TODO handle this situation
            var original_controls = _this.props.mother_state.original_controls
            
            var added_control_ids = _this.props.mother_state.added_control_ids

            // console.log('no context', original_controls, added_control_ids)
            for(var i in added_control_ids){
              if(original_controls[added_control_ids[i]][0]==undefined){
                delete _this.props.mother_state.controls[_this.props.mother_state.cur_path_id][_this.props.val['_id']][added_control_ids[i]]
                delete _this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_regeneration'][added_control_ids[i]]
              }else{
                // 해결해라...
                _this.props.mother_state.controls[_this.props.mother_state.cur_path_id][_this.props.val['_id']][added_control_ids[i]] = original_controls[added_control_ids[i]][0]
                _this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_regeneration'][added_control_ids[i]] = original_controls[added_control_ids[i]][1]
              }
              
            }
            _this.props.mother_this.setState({original_controls:{}})
          }
        })
          
      
    
  }

  render() {
    return (
      <div className='row' style={{height: '100%'}} onPointerUp={this.AllPointerDown.bind(this)}>
        <TaleBrush_TextBox mother_state={this.state} mother_this={this} is_baseline={false}></TaleBrush_TextBox>
        <TaleBrush_Canvas mother_state={this.state} mother_this={this}></TaleBrush_Canvas>
        {/* <div onPointerDown={this.statecheck.bind(this)}>statecheck</div> */}
      </div>
    )
  }
}