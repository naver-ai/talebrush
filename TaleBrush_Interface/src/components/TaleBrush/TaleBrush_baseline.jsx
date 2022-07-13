// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';
import TaleBrush_Canvas from './TaleBrush_Canvas';
import TaleBrush_TextBox from './TaleBrush_TextBox';

export default class TaleBrush_Baseline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode_state: 'idle', // idle, choose_x_axis, choose_y_axis, 
      action_state: 'brush', // 
      seq_draw_char: '',

      generation_mode: 'continuation', 

      seq_draw_prev_pos: undefined,

      attr_total_time: 0,
      
      x_axis: -1, // -1 for sequence, 0 for characters
      y_axis: 0,

      x_axis_color: '#000088',
      y_axis_color: '#880000',

      characters: [{_id:'protagonist', name:'Romeo'}],
      total_length: 8, 

      text: '',
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

      controls: {},
      controls_drawn: {},

      surprise_in_size: false,
      surprise_in_panel: false,

      sent_highlighted: -1, 

      prev_states: [], 
      next_states: [],

      dropdown: false,
      hover_path_id: '',

      being_generated: false, 
    };
  }

  setAllStates(new_state){
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
    this.state.sent_highlighted = -1
    this.state.dropdown=false
    this.setState({})
  }

  storeState(){
    var c_state = JSON.parse(JSON.stringify(this.state))
    delete c_state['prev_states']
    delete c_state['next_states']
    this.state.prev_states.push(c_state)
    if(this.state.prev_states.length>20){

    }
    this.setState({next_states: []})
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
      this.setAllStates(cur_state)
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
      this.setAllStates(cur_state)
    }
  }
  
  componentDidMount(){
    var text_parsed = {'0': []}
    for(var i=0; i<30; i++){
      text_parsed['0'][i] = {'sentence':''}
    }
    // TODO enable below.
    var char_name = 'Romeo'
    // var char_name = prompt('Decide the name of the protagonist')
    var _this = this

    

    this.setState({text_parsed, characters: [{_id:'protagonist', name:char_name}]}, function(){
      var init_state = JSON.parse(JSON.stringify(_this.state))
      _this.state.init_state = init_state
      console.log(init_state)
      _this.state.prev_states.push(init_state)
    })
    
    document.addEventListener('keydown', function(event) {
      if (event.ctrlKey && event.metaKey && event.key === 'z') {
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

  render() {
    return (
      <div className='row' style={{display:'block', margin:'auto', height: '100%'}} onPointerDown={this.AllPointerDown.bind(this)}>
        {/* <TaleBrush_Canvas mother_state={this.state} mother_this={this}></TaleBrush_Canvas> */}
        <TaleBrush_TextBox mother_state={this.state} mother_this={this} is_baseline={true}></TaleBrush_TextBox>
        <div onPointerDown={this.statecheck.bind(this)}>statecheck</div>
      </div>
    )
  }
}