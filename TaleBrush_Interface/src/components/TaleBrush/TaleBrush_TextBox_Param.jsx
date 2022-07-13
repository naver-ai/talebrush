// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';

export default class TaleBrush_TextBox_Param extends React.Component {

  reviseCharacterName(idx){
    if(this.props.mother_state.being_generated==false){
      var charactername = prompt('Rename the character')
      this.props.mother_state.characters[idx]['name'] = charactername
      this.props.mother_this.storeState('change_protagonist_name')
      this.props.mother_this.setState({})
    }
    
  }

  deleteCharacter(idx){
    // TODO we might need to do additional deletion process here... 
    if(this.props.mother_state.characters.length>1){
      if(confirm('Are you sure to delete this character?')){

        this.props.mother_state.characters.splice(idx, 1)
        // var y_axis = this.props.mother_state.y_axis
        var x_axis = this.props.mother_state.x_axis
        console.log(idx, x_axis, y_axis)
        
        // if(y_axis==idx){
        //   y_axis = 0
        //   if(x_axis==0){
        //     y_axis = 1
        //   }
        // }else 
        if(x_axis==idx){
          x_axis = -1
        }
        // if(y_axis>idx){
        //   y_axis = y_axis-1
        // }else 
        if(x_axis>idx){
          x_axis = x_axis-1
        }
        // console.log(idx, x_axis, y_axis)
        // this.props.mother_this.setState({y_axis, x_axis})
        this.props.mother_this.setState({x_axis})
        
      }
    }else{
      alert('There should be at least one character!')
    }
    
  }

  renderCharacters(){
    return this.props.mother_state.characters.map((val, idx)=>{
      return (<div style={{border: 'solid 1px black', padding: '3px', margin: '2px', display:'flex'}}>
        <div style={{flex: 'auto'}}>{val['name']}</div>
        <div style={{display: 'inline-flex'}}>
          <div onPointerDown={this.reviseCharacterName.bind(this, idx)} style={{marginRight:'3px', color:(this.props.mother_state.being_generated)?'#eeeeee':''}}><i class="fa fa-pencil" aria-hidden="true"></i></div>
          {/* <div onPointerDown={this.deleteCharacter.bind(this, idx)}><i class="fa fa-trash" aria-hidden="true"></i></div> */}
        </div>
      </div>)
    })
  }

  addCharacter(){
    if(this.props.mother_state.characters.length<4){
      var charactername = prompt('Name the character')
      var _id = Math.random().toString(36).substring(7)

      // TODO add sentiment analysis result 
      var text_parsed = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id]
      // TODO send request here, maybe...
      for(var i in text_parsed){
        text_parsed[i][_id] = Math.random()
      }

      this.props.mother_state.characters.push({_id:_id, name: charactername, is_protagonist: false})
      this.props.mother_this.setState({})
    }else{
      alert('There would be too many characters to handle')
    }
    
  }

  LengthChange(e){
    if(e.target.value>30){
      alert('The sequence to generate would be too long!')
    }else{
      if(this.props.mother_state.generation_mode=='continuation'){
        if(this.props.mother_state.text_generation_end+1>Math.round(e.target.value)){
          alert('Please adjust your context range first!') 
          return
          // if(Math.round(e.target.value)>this.props.mother_state.text_front_prompt_end+1){
          //   this.props.mother_this.setState({text_generation_end: Math.round(e.target.value)-1})
          // }else if(Math.round(e.target.value)>this.props.mother_state.text_front_prompt_start+1){
          //   this.props.mother_this.setState({text_generation_end: Math.round(e.target.value)-1, text_front_prompt_end: Math.round(e.target.value)-2})
          // }
        }
      }else if(this.props.mother_state.generation_mode=='infilling'){
        if(this.props.mother_state.text_back_prompt_end+1>Math.round(e.target.value)){
          alert('Please adjust your context range first!')
          return
          // if(Math.round(e.target.value)>this.props.mother_state.text_back_prompt_start+1){
          //   this.props.mother_this.setState({text_back_prompt_end: Math.round(e.target.value)-1})
          // }else if(Math.round(e.target.value)>this.props.mother_state.text_front_prompt_end+1){

          //   this.props.mother_this.setState({text_back_prompt_end: Math.round(e.target.value)-1, text_back_prompt_start: Math.round(e.target.value)-2})
          // }
        }
      }
      var _this = this
      this.props.mother_this.setState({total_length: Math.round(e.target.value)}, function(){
        _this.props.mother_this.storeState('length_change')
      })
    }
    
  }

  setSurpriseAsDuration(e){
    console.log(this.props.mother_state.surprise_in_size)
    var _this = this
    if(this.props.mother_state.surprise_in_size==false){
      document.getElementById('surprise_check_panel').checked = false
      this.props.mother_this.setState({surprise_in_size:true, surprise_in_panel:false}, function(){
        _this.props.mother_this.storeState('surprise_level_specification_size')
      })
    }else{
      this.props.mother_this.setState({surprise_in_size:false}, function(){
        _this.props.mother_this.storeState('surprise_level_despecification')
      })
    }
  }

  setSurpriseAsPanel(e){
    var _this = this
    console.log(this.props.mother_state.surprise_in_panel)
    if(this.props.mother_state.surprise_in_panel==false){
      document.getElementById('surprise_check_size').checked = false
      this.props.mother_this.setState({surprise_in_panel:true, surprise_in_size:false}, function(){
        this.setState({})
        _this.props.mother_this.storeState('surprise_level_specification_panel')
      })
    }else{
      this.props.mother_this.setState({surprise_in_panel:false}, function(){
        this.setState({})
        _this.props.mother_this.storeState('surprise_level_despecification')
      })
    }
  }

  render() {
    return (
        <div>
          <div>
            <h5>Protagonist</h5>
            <div>
              {this.renderCharacters()}
            </div>
            {/* <div style={{backgroundColor: '#008800', color:'white', textAlign:'center', borderRadius:'3px'}} onPointerDown={this.addCharacter.bind(this)}>+</div> */}
          </div>

          <div>
            <h5>Text Length</h5>
            <input type='number' step='1' value={this.props.mother_state.total_length} onChange={this.LengthChange.bind(this)} disabled={this.props.mother_state.being_generated}></input>

          </div>
          <div>
            <h5>Surprise Level Specification</h5>
            
            <label>
              <input type='checkbox' id='surprise_check_size' value={this.props.mother_state.surprise_in_size} onChange={this.setSurpriseAsDuration.bind(this)}></input>
              <span>Surprise as stroke size/duration.</span>
            </label>
            <label>
              <input type='checkbox' id='surprise_check_panel' value={this.props.mother_state.surprise_in_panel} onChange={this.setSurpriseAsPanel.bind(this)}></input>
              <span>Surprise in separate panel.</span>
            </label>

          </div>
            
        </div>
    )
  }
}