// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';
import TaleBrush_Canvas_Draw_Area_Seq from './TaleBrush_Canvas_Draw_Area_Seq';
import TaleBrush_Canvas_SenVis_Seq from './TaleBrush_Canvas_SenVis_Seq';
import pen_on from '../../img/pen_on.png'
import pen_off from '../../img/pen_off.png'
import erase_on from '../../img/eraser_on.png'
import erase_off from '../../img/eraser_off.png'
import cursor_b from '../../img/cursor_b.png'
import cursor_e from '../../img/cursor_e.png'
import generate_hover from '../../img/generate_button_hover.png'
import generate_default from '../../img/generate_button_default.png'
import {MAX_CHARACTERS, RELATIONSHIP_PALETTE, paletteFor, nextColor} from './TaleBrush_characters'
import {fortuneRecognition, needsRating} from './TaleBrush_Generate'

export default class TaleBrush_Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          move_state: '',
        };
      }

    // basic_pointer_down(){
    //     if(this.props.mother_state.mode_state=='choose_x_axis' || this.props.mother_state.mode_state=='choose_y_axis'){
    //         this.props.mother_this.setState({mode_state:'idle'})
    //     }
    // }

    // Heights (%) of the stacked panels: relationship panel (optional) is smaller; main + surprise share the rest.
    panelHeights(){
        var rel = this.relationshipVisible() ? 30 : 0
        var n = this.props.mother_state.surprise_in_panel ? 2 : 1
        return {rel: rel, main: (100-rel)/n}
    }

    relationshipVisible(){
        return this.props.mother_state.relationship_in_panel && this.props.mother_state.characters.length==2
    }

    renderBands(){
        return (<div style={{position: 'absolute', width:'100%', height:'100%'}}> 
            <div style={{display:'block', width:'100%', height:'calc(20% - 4px)', backgroundColor : 'rgba(255, 199, 0, 0.05)',
                        borderRadius:'20px 20px 0px 0px'}}></div>
            <div style={{display:'block', width:'100%', height:'calc(20% - 4px)', marginTop:'5px', backgroundColor : 'rgba(229, 202, 109, 0.05)'}}></div>
            <div style={{display:'block', width:'100%', height:'calc(20% - 4px)', marginTop:'5px', backgroundColor : 'rgba(217, 217, 217, 0.05)'}}></div>
            <div style={{display:'block', width:'100%', height:'calc(20% - 4px)', marginTop:'5px', backgroundColor : 'rgba(128, 128, 128, 0.05)'}}></div>
            <div style={{display:'block', width:'100%', height:'calc(20% - 4px)', marginTop:'5px', backgroundColor : 'rgba(0, 0, 0, 0.05)',
                        borderRadius:'0px 0px 20px 20px'}}></div>
        </div>)
    }

    // One fortune canvas holding every character's layer: inactive layers are drawn first and faded,
    // the active layer on top; only the active layer receives pointer input.
    renderFortuneCanvas(){
        var state = this.props.mother_state
        var active = state.characters.filter(function(c){ return c['_id']==state.active_character })
        var inactive = state.characters.filter(function(c){ return c['_id']!=state.active_character })
        var layer = (c, faded) => (
            <div key={'layer_'+c['_id']} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity: faded?0.28:1, pointerEvents:'none'}}>
                <TaleBrush_Canvas_SenVis_Seq mother_this={this.props.mother_this} mother_state={state} val={c} palette={paletteFor(c)} hide_background={faded} idx={0}></TaleBrush_Canvas_SenVis_Seq>
            </div>)
        return(<div style={{
            width:'100%', 
            height: this.panelHeights().main+'%', 
            position:'relative', 
            borderLeft:'solid 2px rgba(88.18, 79.45, 79.45, 0.10)'}}>
            <div className='canvas'></div>
            {this.renderBands()}
            {inactive.map((c)=>layer(c, true))}
            {active.map((c)=>layer(c, false))}
            {active.map((c)=><TaleBrush_Canvas_Draw_Area_Seq key={'draw_'+c['_id']} mother_this={this.props.mother_this} mother_state={state} val={c} idx={0}></TaleBrush_Canvas_Draw_Area_Seq>)}
        </div>)
    }

    renderASurpriseCanvas(){
        return(<div style={{width:'100%', height: this.panelHeights().main+'%', position:'relative', borderBottom:'solid 5px white'}}>
            <div className='canvas'></div>
            <TaleBrush_Canvas_SenVis_Seq mother_this={this.props.mother_this} mother_state={this.props.mother_state} val={{'_id': '_surprise'}} idx={-1} notrendersent={true}></TaleBrush_Canvas_SenVis_Seq>
            <TaleBrush_Canvas_Draw_Area_Seq mother_this={this.props.mother_this} mother_state={this.props.mother_state} val={{'_id': '_surprise'}} idx={-1}></TaleBrush_Canvas_Draw_Area_Seq>
            <div style={{position:'absolute', bottom: '0px', left: '30px', width: 'max-content', color: '#333333', cursor:'default', transformOrigin:'left', transform:'rotate(-90deg)'}}>Low Suprise</div>
            <div style={{position:'absolute', top: '90px', left: '30px', width: 'max-content', color: '#ff4d00', cursor:'default', transformOrigin:'left', transform:'rotate(-90deg)'}}>High Surprise</div>
        </div>)
    }

    // Removes the relationship track (drawn line and ratings) from every path, after confirmation.
    clearRelationship(){
        var state = this.props.mother_state
        if(state.being_generated || !confirm('Clear the relationship line and its ratings?')){
            return
        }
        for(var path_id in state.controls){
            state.controls[path_id]['_relationship'] = {}
        }
        for(var path_id in state.text_parsed){
            for(var i in state.text_parsed[path_id]){
                delete state.text_parsed[path_id][i]['_relationship']
            }
        }
        state.original_controls = {}
        this.props.mother_this.storeState('clear_relationship')
        this.props.mother_this.setState({})
    }

    // Smaller sibling of the fortune canvas: same x-axis, y from hostile (0) to close (100).
    renderRelationshipCanvas(){
        var state = this.props.mother_state
        var val = {'_id': '_relationship'}
        var label = {position:'absolute', left:'30px', width:'max-content', cursor:'default', transformOrigin:'left', transform:'rotate(-90deg)'}
        return(<div style={{width:'100%', height: this.panelHeights().rel+'%', position:'relative', borderLeft:'solid 2px rgba(88.18, 79.45, 79.45, 0.10)', borderTop:'solid 5px white'}}>
            <div className='canvas'></div>
            {this.renderBands()}
            <TaleBrush_Canvas_SenVis_Seq mother_this={this.props.mother_this} mother_state={state} val={val} palette={RELATIONSHIP_PALETTE} idx={-1}></TaleBrush_Canvas_SenVis_Seq>
            <TaleBrush_Canvas_Draw_Area_Seq mother_this={this.props.mother_this} mother_state={state} val={val} idx={-1}></TaleBrush_Canvas_Draw_Area_Seq>
            <div style={{position:'absolute', top:'4px', left:'12px', fontFamily:'Spoqa Han Sans Neo', fontSize:'13px', color:'rgba(10, 10, 10, 0.80)', cursor:'default', pointerEvents:'none'}}>
                Relationship: {state.characters[0]['name']} &harr; {state.characters[1]['name']}
            </div>
            <div onPointerDown={this.clearRelationship.bind(this)} style={{position:'absolute', top:'4px', right:'8px', fontSize:'12px', color:'#888888', cursor:'pointer'}}>clear</div>
            <div style={Object.assign({bottom:'0px', color:'#333333'}, label)}>Hostile</div>
            <div style={Object.assign({top:'60px', color: RELATIONSHIP_PALETTE.color}, label)}>Close</div>
        </div>)
    }

    toggleBrushState(action_state){
        this.props.mother_this.setState({action_state})
        console.log(action_state);
        if(action_state == 'erase'){
            document.getElementById('TB_canvas').style.cursor = 
                'url('+cursor_e+'), auto'
        } else {
            document.getElementById('TB_canvas').style.cursor = 
                'url('+cursor_b+'), auto'
        }
    }

    IndicatorMoveStart(state_name){
        if(this.props.mother_state.being_generated){
            return
        }
        this.setState({move_state:state_name})
    }

    IndicatorMove(e){
        
        if(this.state.move_state!=''){
            var t = document.getElementById('TB_handle').getBoundingClientRect().left
            var h = document.getElementById('TB_handle').scrollWidth
            // var st = document.getElementById('TB_canvas').scrollTop
            var ratio = (e.pageX-t)/h + 0.5/this.props.mother_state.total_length
            var idx = Math.floor(ratio*this.props.mother_state.total_length)
            
            console.log(ratio)
            // console.log((e.pageY-t)/h)
            
            if(this.props.mother_state.generation_mode=='continuation'){
              if(this.state.move_state=='front_end'){
                if(this.props.mother_state.text_front_prompt_start<=idx && idx<this.props.mother_state.text_generation_end){
                  this.props.mother_this.setState({text_front_prompt_end:idx})
                }
                
              }else if(this.state.move_state=='front_start'){
                if(this.props.mother_state.text_front_prompt_end>=idx && idx>=0){
                  this.props.mother_this.setState({text_front_prompt_start:idx})
                }
                
              }else if(this.state.move_state=='gen_end'){
                if(this.props.mother_state.text_front_prompt_end<idx && this.props.mother_state.total_length>idx){
                  this.props.mother_this.setState({text_generation_end:idx})
                }
                
              }
            }else if(this.props.mother_state.generation_mode=='infilling'){
              if(this.state.move_state=='front_end'){
                if(this.props.mother_state.text_front_prompt_start<=idx && idx+1<this.props.mother_state.text_back_prompt_start){
                  this.props.mother_this.setState({text_front_prompt_end:idx})
                }
                
              }else if(this.state.move_state=='front_start'){
                if(this.props.mother_state.text_front_prompt_end>=idx && idx>=0){
                  this.props.mother_this.setState({text_front_prompt_start:idx})
                }
                
              }else if(this.state.move_state=='back_end'){
                
                if(this.props.mother_state.text_back_prompt_start<=idx && this.props.mother_state.total_length>idx){
                  this.props.mother_this.setState({text_back_prompt_end:idx})
                }
                
              }else if(this.state.move_state=='back_start'){
                console.log(idx, this.props.mother_state.text_back_prompt_end, this.props.mother_state.text_front_prompt_end)
                if(this.props.mother_state.text_back_prompt_end>=idx && this.props.mother_state.text_front_prompt_end<idx+1){
                  this.props.mother_this.setState({text_back_prompt_start:idx})
                }
                
              }
            }
        }  
    }

    IndicatorMoveEnd(e){
        e.stopPropagation()
        if(this.state.move_state!=''){
            this.props.mother_this.storeState('context_adjust')
            this.props.mother_this.highlightSentence(this.props.mother_state.text, this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id])
            this.setState({move_state:''})
        }
    }

  

    renderContIndicators(){
        var front_start = this.props.mother_state.text_front_prompt_start
        var front_end = this.props.mother_state.text_front_prompt_end
        var gen_end = this.props.mother_state.text_generation_end
        var total_length = this.props.mother_state.total_length

        var fs_p = (front_start-0.5)*100/total_length
        if(fs_p<0){
            fs_p = 0
        }
        var fe_p = (front_end+0.5)*100/total_length
        if(fe_p>100){
            fe_p=100
        }

        var fs_fe_w = fe_p-fs_p
        var fs_fe_m = (fs_p+fe_p)/2

        var ge_p = (gen_end+0.5)*100/total_length
        if(ge_p>100){
            ge_p = 100
        }

        var ge_fe_w = (gen_end-front_end)*100/total_length
        var ge_fe_m = (front_end+gen_end+0.5)*100/2/total_length

        return(<div style={{position:'absolute', top:'10px', width:'100%'}}>
            {/* <div style={{position:'absolute', backgroundColor:'rgba(153, 153, 153, 1)', borderRadius:'4px', height:'1px', top: '6px', left: fs_p+'%', width: 'calc('+fs_fe_w+'% - 10px)'}}></div> */}
            {/* <div className='noselect' style={{position:'absolute', fontSize:'small', left: 'calc('+fs_fe_m+'% - 23px)', top: -2}}>Context</div> */}
            <div onPointerDown={this.IndicatorMoveStart.bind(this, 'front_start')} 
                onPointerMove={this.IndicatorMove.bind(this)} 
                onPointerUp={this.IndicatorMoveEnd.bind(this)} 
            style={{
                position:'absolute', width: '6px', height: '15px', 
                backgroundColor:'gray', borderRadius:'4px', left: (fs_p)+'%'
            }}></div>
            <div onPointerDown={this.IndicatorMoveStart.bind(this, 'front_end')} 
                onPointerMove={this.IndicatorMove.bind(this)} 
                onPointerUp={this.IndicatorMoveEnd.bind(this)} 
            style={{
                position:'absolute', width: '6px', height: '15px', 
                backgroundColor:'gray', borderRadius:'4px',left: 'calc('+fe_p+'% - 5px)'
            }}></div>
            {/* <div style={{position:'absolute', backgroundColor:'rgba(84, 160, 248, 1)', borderRadius:'4px', height:'1px', top: '6px', left: 'calc('+fe_p+'% + 5px)', width: 'calc('+ge_fe_w+'% - 15px)'}}></div> */}
            {/* <div className='noselect' style={{position:'absolute', fontSize:'small', left: 'calc('+ge_fe_m+'% - 10px)', top: -2}}>To gen</div> */}
            <div onPointerDown={this.IndicatorMoveStart.bind(this, 'gen_end')} 
                onPointerMove={this.IndicatorMove.bind(this)} 
                onPointerUp={this.IndicatorMoveEnd.bind(this)} 
            style={{
                position:'absolute', width: '6px', height: '15px', 
                backgroundColor:'gray', borderRadius:'4px', left: 'calc('+ge_p+'% - 5px)'
            }}></div>
            
        </div>)

    }

    renderInfillIndicators(){
        var front_start = this.props.mother_state.text_front_prompt_start
        var front_end = this.props.mother_state.text_front_prompt_end
        var back_start = this.props.mother_state.text_back_prompt_start
        var back_end = this.props.mother_state.text_back_prompt_end
        var total_length = this.props.mother_state.total_length

        var fs_p = (front_start-0.5)*100/total_length
        if(fs_p<0){
            fs_p = 0
        }
        var fe_p = (front_end+0.5)*100/total_length
        if(fe_p>100){
            fe_p=100
        }
        var bs_p = (back_start-0.5)*100/total_length
        if(bs_p<0){
            bs_p = 0
        }
        var be_p = (back_end+0.5)*100/total_length
        if(be_p>100){
            be_p=100
        }

        var fs_fe_w = fe_p-fs_p
        var fs_fe_m = (fs_p+fe_p)/2

        var bs_be_w = be_p-bs_p
        var bs_be_m = (bs_p+be_p)/2

        var bs_fe_w = (bs_p-fe_p)
        var bs_fe_m = (bs_p+fe_p)/2

        return(<div style={{position:'absolute', top:'10px', width:'100%'}}>

            <div style={{position:'absolute', backgroundColor:'#ccffff', height:'3px', top: '5.5px', left: fs_p+'%', width: 'calc('+fs_fe_w+'% - 10px)'}}></div>
            <div className='noselect' style={{position:'absolute', fontSize:'small', left: 'calc('+fs_fe_m+'% - 23px)', top: -2}}>Context</div>
            <div onPointerDown={this.IndicatorMoveStart.bind(this, 'front_start')} 
                onPointerMove={this.IndicatorMove.bind(this)} 
                onPointerUp={this.IndicatorMoveEnd.bind(this)} 
            style={{position:'absolute', width: '15px', height: '15px', backgroundColor:'#88dddd', left: (fs_p)+'%'}}></div>
            <div onPointerDown={this.IndicatorMoveStart.bind(this, 'front_end')} 
                onPointerMove={this.IndicatorMove.bind(this)} 
                onPointerUp={this.IndicatorMoveEnd.bind(this)} 
            style={{position:'absolute', width: '15px', height: '15px', backgroundColor:'#88dddd', left: 'calc('+fe_p+'% - 15px)'}}></div>

            {/* <div style={{position:'absolute', backgroundColor:'#eeeeee', height:'3px', top: '5.5px', left: 'calc('+fe_p+'% + 5px)', width: 'calc('+ge_fe_w+'% - 15px)'}}></div>
            <div className='noselect' style={{position:'absolute', fontSize:'small', left: 'calc('+ge_fe_m+'% - 10px)', top: -2}}>To gen</div> */}
            <div style={{position:'absolute', backgroundColor:'#eeeeee', height:'3px', top: '5.5px', left: 'calc('+fe_p+'% + 5px)', width: 'calc('+bs_fe_w+'% - 10px)'}}></div>
            <div className='noselect' style={{position:'absolute', fontSize:'small', left: 'calc('+bs_fe_m+'% - 20px)', top: -2}}>To gen</div>

            <div style={{position:'absolute', backgroundColor:'#ccffff', height:'3px', top: '5.5px', left: bs_p+'%', width: 'calc('+bs_be_w+'% - 10px)'}}></div>
            <div className='noselect' style={{position:'absolute', fontSize:'small', left: 'calc('+bs_be_m+'% - 23px)', top: -2}}>Context</div>
            <div onPointerDown={this.IndicatorMoveStart.bind(this, 'back_start')} 
                onPointerMove={this.IndicatorMove.bind(this)} 
                onPointerUp={this.IndicatorMoveEnd.bind(this)} 
            style={{position:'absolute', width: '15px', height: '15px', backgroundColor:'#88dddd', left: (bs_p)+'%'}}></div>
            <div onPointerDown={this.IndicatorMoveStart.bind(this, 'back_end')} 
                onPointerMove={this.IndicatorMove.bind(this)} 
                onPointerUp={this.IndicatorMoveEnd.bind(this)} 
            style={{position:'absolute', width: '15px', height: '15px', backgroundColor:'#88dddd', left: 'calc('+be_p+'% - 15px)'}}></div>
            
        </div>)

    }

  changeCharacterName(idx, e){
    if(this.props.mother_state.being_generated==false){
      this.props.mother_state.characters[idx]['name'] = e.target.value
      this.props.mother_this.setState({})
    }
  }

  reviseCharacterName(idx, e){
    if(this.props.mother_state.being_generated==false){
      var state = this.props.mother_state
      var name = e.target.value.trim()
      // names are the prompt keys, so they must be unique
      if(name!='' && state.characters.some(function(c, i){ return i!=idx && c['name'].toLowerCase()==name.toLowerCase() })){
        alert('Another character already has this name. Please pick a different one.')
        name = ''
      }
      state.characters[idx]['name'] = name
      this.props.mother_this.storeState('change_character_name')
      this.props.mother_this.setState({})
      // rate existing sentences for a newly named character
      var rows = state.text_parsed[state.cur_path_id]
      for(var i in rows){
        if(needsRating(state, rows[i])){
          fortuneRecognition(this, i)
        }
      }
    }
  }

  setActiveCharacter(_id){
    if(this.props.mother_state.being_generated==false && this.props.mother_state.active_character!=_id){
      var _this = this
      this.props.mother_this.setState({active_character: _id}, function(){
        _this.props.mother_this.highlightSentence(_this.props.mother_state.text, _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id])
      })
    }
  }

  addCharacter(){
    var state = this.props.mother_state
    if(state.being_generated){
      return
    }
    if(state.characters.length>=MAX_CHARACTERS){
      alert('TaleBrush supports up to '+MAX_CHARACTERS+' characters for now.')
      return
    }
    var _id = Math.random().toString(36).substring(7)
    for(var path_id in state.controls){
      state.controls[path_id][_id] = {}
    }
    state.characters.push({_id: _id, name: '', color: nextColor(state.characters)})
    this.props.mother_this.setState({active_character: _id}, function(){
      // after the click's own focus change, otherwise the input loses focus again
      setTimeout(function(){ document.getElementById('character_input_'+_id).focus() }, 0)
    })
  }

  // Deletes the character's layer data (controls and ratings) in every path.
  deleteCharacter(_id, e){
    e.stopPropagation()
    var state = this.props.mother_state
    if(state.being_generated || state.characters.length<2){
      return
    }
    var idx = state.characters.findIndex(function(c){ return c['_id']==_id })
    if(!confirm('Delete '+(state.characters[idx]['name'] || 'this character')+' and its layer? This cannot be undone.')){
      return
    }
    state.characters.splice(idx, 1)
    for(var path_id in state.controls){
      delete state.controls[path_id][_id]
    }
    for(var path_id in state.text_parsed){
      for(var i in state.text_parsed[path_id]){
        delete state.text_parsed[path_id][i][_id]
      }
    }
    state.original_controls = {}
    state.added_control_ids = []
    var _this = this
    this.props.mother_this.setState({active_character: state.characters[0]['_id']}, function(){
      _this.props.mother_this.storeState('remove_character')
      _this.props.mother_this.highlightSentence(state.text, state.text_parsed[state.cur_path_id])
    })
  }

  // Character chips double as picker and legend (dot = layer colour, solid border = active).
  renderCharacterChips(){
    var state = this.props.mother_state
    var chips = state.characters.map((c, idx)=>{
      var active = c['_id']==state.active_character
      return (<div key={c['_id']} onPointerDown={this.setActiveCharacter.bind(this, c['_id'])} style={{
          display: 'inline-block', verticalAlign:'middle', marginRight:'8px',
          height: '36px', border: '1.2px solid '+(active?'currentColor':'#bbbbbb'), borderRadius:'8px', padding:'4px 10px 4px 10px',
          opacity: active?1:0.6, cursor:'default'}}>
          <span style={{display:'inline-block', verticalAlign:'middle', width:'10px', height:'10px', borderRadius:'50%', backgroundColor: paletteFor(c).color, marginRight:'6px', marginTop:'-2px'}}></span>
          <input type='text' id={'character_input_'+c['_id']}
            placeholder={idx==0?'Protagonist':'Name'} spellCheck='false'
            style={{
                display:'inline-block', width: Math.min(130, Math.max(c['name'].length, idx==0?11:5)*8.5+6)+'px', 
                textAlign:'left', 
                border: 'none', backgroundColor:'transparent', resize: 'none', overflow:'visible', 
                fontFamily: 'Spoqa Han Sans Neo', fontSize: '15.6px', fontWeight: '400', 
                lineHeight: '140%', color: 'rgba(10, 10, 10, 0.80)',
                marginTop:'2px', height: '20px'
                }}
            value = {c['name']}
            onChange={this.changeCharacterName.bind(this, idx)}
            onBlur={this.reviseCharacterName.bind(this, idx)}
            disabled = {state.being_generated}
            ></input>
          {state.characters.length>1 && <span title='Remove character' onPointerDown={this.deleteCharacter.bind(this, c['_id'])} style={{marginLeft:'4px', color:'#888888', cursor:'pointer'}}>&times;</span>}
        </div>)
    })
    return (<div>
        {chips}
        <div title='Add a character' onPointerDown={this.addCharacter.bind(this)} style={{
            display:'inline-block', verticalAlign:'middle', height:'36px', width:'36px', textAlign:'center',
            border:'1.2px dashed #bbbbbb', borderRadius:'8px', lineHeight:'31px', fontSize:'20px', color:'#888888', cursor:'pointer'}}>+</div>
    </div>)
  }

  render() {

    return (
        <div id='TB_canvas' className='col s6 noselect' style={{
            backgroundColor:'rgba(255, 251.81, 248.87, 0.5)', borderLeft:'3px solid #F8F1EB', 
            width:'45%', position: 'fixed', height:'100%', display: 'flex',
            marginLeft:'55%', 
            flexDirection: 'column',
            cursor: 'url('+cursor_b+'), auto'
            }}>
            {/* <h4>TaleBrush</h4> */}
            
            <div style={{marginTop:'134px', marginLeft: '10%'}}>
                {this.renderCharacterChips()}
            </div>     

            <div 
                // disabled={this.props.mother_state.being_generated || (this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id].length==0 && this.props.mother_state.total_length>1)} 
                style={{display: (this.props.mother_state.being_generated || Object.keys(this.props.mother_state.original_controls).length==0 || this.props.mother_state.mode_state=='seq_draw' || this.props.mother_state.dropdown)?'none':'', position: 'fixed', top:'134px', right:'5.2%', width:'fit-content', textAlign:'center', cursor:'default'}}>
                    <div  
                        onMouseOver={(event) =>{ document.getElementById("generate_button").src=generate_hover}}
                        onMouseOut={(event) =>{ document.getElementById("generate_button").src=generate_default}} 
                        style={{display: 'inline-block', verticalAlign:'bottom', marginTop:'0%'}}>
                        <img id='generate_button' src={generate_default} onPointerDown={this.props.mother_this.generate.bind(this, this)}  style={{height: '35px', visibility:'visible'}}/>
                    </div>
            </div>

            <div style={{
                flex: 'auto', position: 'relative', 
                marginTop: '20px'}}>

                <div style={{position: 'absolute', top: '10px', marginLeft:'10%', width:'80%', height: 'calc(100% - 180px)', overflow: 'hidden', opacity:(this.props.mother_state.being_generated)?'0.5':'1'}}>
                    {/* <div style={{position: 'absolute', width:'100%', height:'100%'}}> 
                        <div style={{display:'block', width:'100%', height:'19.2%', backgroundColor : 'rgba(255, 199, 0, 0.05)',
                                    borderRadius:'20px 20px 0px 0px'}}></div>
                        <div style={{display:'block', width:'100%', height:'19.2%', marginTop:'1%', backgroundColor : 'rgba(229, 202, 109, 0.05)'}}></div>
                        <div style={{display:'block', width:'100%', height:'19.2%', marginTop:'1%', backgroundColor : 'rgba(217, 217, 217, 0.05)'}}></div>
                        <div style={{display:'block', width:'100%', height:'19.2%', marginTop:'1%', backgroundColor : 'rgba(128, 128, 128, 0.05)'}}></div>
                        <div style={{display:'block', width:'100%', height:'19.2%', marginTop:'1%', backgroundColor : 'rgba(0, 0, 0, 0.05)',
                                    borderRadius:'0px 0px 20px 20px'}}></div>
                    </div> */}
                    
                    {this.renderFortuneCanvas()}
                    {this.props.mother_state.surprise_in_panel && this.renderASurpriseCanvas()}
                    {this.relationshipVisible() && this.renderRelationshipCanvas()}


                    {/* <div id='TB_handle' style={{position:'absolute', top: 'calc(50% - 20px)', height: '40px', left:'0px', right:'0px'}}>
                        {this.props.mother_state.generation_mode=='continuation' && this.renderContIndicators()}
                        {this.props.mother_state.generation_mode=='infilling' && this.renderInfillIndicators()}
                    </div> */}
                </div>

                
                {/* {this.renderACanvas()} */}
            </div>

            <div style={{position:'absolute', width:'100%', marginLeft:'-11px', bottom:'40px', textAlign:'center'}}>
                <div style={{position:'absolute', display:'inline-block', marginLeft:'-4px', width:'128px', height:'60px', backgroundColor:'gray', borderRadius:'10px', zIndex:'-1'}}/>
                <div style={{display:'inline-block'}}>
                    {<div style={{marginRight: '10px'}}>
                        <div className='btn' style={{backgroundColor:'transparent', width:'60px', boxShadow:'none', height:'60px'}}
                        onPointerDown={this.toggleBrushState.bind(this, 'brush')}>
                            <img src={(this.props.mother_state.action_state=='erase')?pen_on:pen_off} style={{
                                display:'inline', width:'52px', marginLeft:'-13px', marginTop:'4px'
                            }}/>
                        </div>
                        <div className='btn' style={{backgroundColor:'transparent', width:'60px', boxShadow:'none', height:'60px'}}
                        onPointerDown={this.toggleBrushState.bind(this, 'erase')}>
                            <img src={(this.props.mother_state.action_state=='erase')?erase_on:erase_off} style={{
                                display:'inline', width:'52px', marginLeft:'-13px', marginTop:'4px'
                            }}/>
                        </div>
                    </div>}                
                </div>
            </div>

            
        </div>
    )
  }
}