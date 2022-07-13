// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';
import TaleBrush_Canvas_Draw_Area_Seq from './TaleBrush_Canvas_Draw_Area_Seq';
import TaleBrush_Canvas_SenVis_Seq from './TaleBrush_Canvas_SenVis_Seq';
import TaleBrush_Canvas_SenVis_Att from './TaleBrush_Canvas_SenVis_Att'
import TaleBrush_Canvas_Draw_Area_Att from './TaleBrush_Canvas_Draw_Area_Att';
import axios from 'axios';
import dl_server from './TaleBrush_var';
import pen_on from '../../img/pen_on.png'
import pen_off from '../../img/pen_off.png'
import erase_on from '../../img/eraser_on.png'
import erase_off from '../../img/eraser_off.png'
import cursor_b from '../../img/cursor_b.png'
import cursor_e from '../../img/cursor_e.png'
import generate_hover from '../../img/generate_button_hover.png'
import generate_default from '../../img/generate_button_default.png'

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

    renderXaxis(){
        if(this.props.mother_state.x_axis==-1){
            return 'Sequence'
        }else{
            return this.props.mother_state.characters[this.props.mother_state.x_axis]['name']+"'s fortune"
        }
    }

    renderYaxis(idx){
        return this.props.mother_state.characters[idx]['name']+"'s fortune"

    }

    toggleXaxisChoose(e){
        e.stopPropagation()
        // if(this.props.mother_state.action_state=='idle'){
            if(this.props.mother_state.mode_state!='choose_x_axis'){
                this.props.mother_this.setState({mode_state: 'choose_x_axis'})
            }else{
                this.props.mother_this.setState({mode_state: 'idle'})
            }
        // }
    }

    toggleYaxisChoose(e){
        e.stopPropagation()
        // if(this.props.mother_state.action_state=='idle'){
            if(this.props.mother_state.mode_state!='choose_y_axis'){
                this.props.mother_this.setState({mode_state: 'choose_y_axis'})
            }else{
                this.props.mother_this.setState({mode_state: 'idle'})
            }
        // }
    }

    // XaxisChooseElement(idx){
    //     if(idx!=-1){
    //         var char1 = this.props.mother_state.characters[idx]
    //         var char2 = this.props.mother_state.characters[this.props.mother_state.y_axis]
    //         var x_controls = this.props.mother_state.controls[char1['_id']]
    //         var y_controls = this.props.mother_state.controls[char2['_id']]
    //         if(x_controls==undefined){x_controls={}}
    //         if(y_controls==undefined){y_controls={}}
    //         var full_counter = 0
    //         var empty_exist = false
    //         var init_overlap = -1
    //         var overlap_end = -1
    //         var overlap_counter = 0
    //         // console.log(this.props.mother_state.text_prompt_range, this.props.mother_state.total_length)
    //         for (var i=this.props.mother_state.text_prompt_range+1; i<this.props.mother_state.total_length; i++){
    //             console.log('no at all?')
    //             if(x_controls[i]==undefined || y_controls[i]==undefined){
    //                 empty_exist = true
    //             }
    //             if(x_controls[i]==undefined && y_controls[i]==undefined){
    //                 full_counter = full_counter + 1
    //             }
    //             if(x_controls[i]!=undefined || y_controls[i]!=undefined){
    //                 overlap_counter = overlap_counter + 1
    //             }
    //             if(x_controls[i]!=undefined && y_controls[i]!=undefined){
                    
    //                 if(init_overlap==-1){
    //                     init_overlap = i
    //                 }
    //                 if(init_overlap!=-1){
    //                     overlap_end = i
    //                 }
    //             }
    //         }



    //         console.log(empty_exist)
    //         if(init_overlap==this.props.mother_state.text_prompt_range+1 && overlap_end-init_overlap+1==overlap_counter){
    //             this.props.mother_this.setState({x_axis: idx,mode_state: 'idle'})  
                
    //         }
    //         else if(full_counter==this.props.mother_state.total_length-this.props.mother_state.text_prompt_range-1){
    //             // just let it change
    //             this.props.mother_this.setState({x_axis: idx,mode_state: 'idle'})   
    //         }else if(empty_exist){
    //             if(confirm("As you did not fully specify controls for both characters, they will be reset. Will you proceed?")){
    //                 this.props.mother_state.controls[char1['_id']] = undefined
    //                 this.props.mother_state.controls[char2['_id']] = undefined
    //                 this.props.mother_this.setState({x_axis: idx,mode_state: 'idle'})
    //             }
    //         }else{
    //             // just let it change
    //             console.log('passing here')
    //             this.props.mother_this.setState({x_axis: idx,mode_state: 'idle'})
    //         }
    //     }else{
    //         this.props.mother_this.setState({x_axis: idx,mode_state: 'idle'})
    //     }
    // }

    // renderXaxisChoose(){
    //     return (<div style={{position:'absolute', bottom:'50px', right: '0px', padding: '10px', backgroundColor: '#333333', color: 'white', borderRadius: '5px'}}>
    //         {this.props.mother_state.x_axis!=-1 && <div onPointerDown={this.XaxisChooseElement.bind(this, -1)} style={{cursor: 'default'}}>Sequence</div>}
    //         {this.props.mother_state.characters.map((val, idx)=>{
    //             if(idx!=this.props.mother_state.x_axis && idx!= this.props.mother_state.y_axis){
    //                 return (<div key={'xaxischoose_'+idx} onPointerDown={this.XaxisChooseElement.bind(this, idx)} style={{cursor: 'default'}}>
    //                     {val['name']}'s fortune
    //                 </div>)
    //             }
    //         })}
    //     </div>)
    // }

    // YaxisChooseElement(idx){
    //     var char1 = this.props.mother_state.characters[this.props.mother_state.x_axis]
    //     var char2 = this.props.mother_state.characters[idx]
    //     var x_controls = this.props.mother_state.controls[char1['_id']]
    //     var y_controls = this.props.mother_state.controls[char2['_id']]
    //     if(x_controls==undefined){x_controls={}}
    //     if(y_controls==undefined){y_controls={}}
    //     var full_counter = 0
    //     var empty_exist = false
    //     for (var i=this.props.mother_state.text_prompt_range+1; i<this.props.mother_state.total_length; i++){
    //         if(x_controls[i]==undefined || y_controls[i]==undefined){
    //             empty_exist = true
    //         }
    //         if(x_controls[i]==undefined && y_controls[i]==undefined){
    //             full_counter = full_counter + 1
    //         }
    //     }
    //     console.log(full_counter, this.props.mother_state.total_length-this.props.mother_state.text_prompt_range)
    //     if(full_counter==this.props.mother_state.total_length-this.props.mother_state.text_prompt_range-1){
    //         // just let it change
    //         this.props.mother_this.setState({y_axis: idx,mode_state: 'idle'})   
    //     }else if(empty_exist){
    //         if(confirm("As you did not fully specify controls for both characters, they will be reset. Will you proceed?")){
    //             this.props.mother_state.controls[char1['_id']] = undefined
    //             this.props.mother_state.controls[char2['_id']] = undefined
    //             this.props.mother_this.setState({y_axis: idx,mode_state: 'idle'})
    //         }
    //     }else{
    //         // just let it change
    //         this.props.mother_this.setState({y_axis: idx,mode_state: 'idle'})
    //     }
    // }

    // renderYaxisChoose(){
    //     return (<div style={{position:'absolute', top: '0px', left: '40px', padding: '10px', backgroundColor: '#333333', color:'white', borderRadius:'5px'}}>
    //         {this.props.mother_state.characters.map((val, idx)=>{
    //             if(idx!=this.props.mother_state.y_axis && idx!=this.props.mother_state.x_axis){
    //                 return (<div key={'yaxischoose_'+idx} onPointerDown={this.YaxisChooseElement.bind(this, idx)} style={{cursor: 'default'}}>
    //                     {val['name']}'s fortune
    //                 </div>)
    //             }
    //         })}
    //     </div>)
        
    // }

    renderSequenceCanvases(){
        return this.props.mother_state.characters.map((val, idx)=>{
            return this.renderACanvas(val, idx)
        })

    }

    

    renderACanvas(val, idx){
        var additional = 0
        if(this.props.mother_state.surprise_in_panel){
            additional = 1
        }
        return(<div style={{
            width:'100%', 
            height: 100/(this.props.mother_state.characters.length+additional)+'%', 
            position:'relative', 
            borderLeft:'solid 2px rgba(88.18, 79.45, 79.45, 0.10)'}}>
            <div className='canvas'></div>
            {val['_id']!='_surprise' && <div style={{position: 'absolute', width:'100%', height:'100%'}}> 
                <div style={{display:'block', width:'100%', height:'calc(20% - 4px)', backgroundColor : 'rgba(255, 199, 0, 0.05)',
                            borderRadius:'20px 20px 0px 0px'}}></div>
                <div style={{display:'block', width:'100%', height:'calc(20% - 4px)', marginTop:'5px', backgroundColor : 'rgba(229, 202, 109, 0.05)'}}></div>
                <div style={{display:'block', width:'100%', height:'calc(20% - 4px)', marginTop:'5px', backgroundColor : 'rgba(217, 217, 217, 0.05)'}}></div>
                <div style={{display:'block', width:'100%', height:'calc(20% - 4px)', marginTop:'5px', backgroundColor : 'rgba(128, 128, 128, 0.05)'}}></div>
                <div style={{display:'block', width:'100%', height:'calc(20% - 4px)', marginTop:'5px', backgroundColor : 'rgba(0, 0, 0, 0.05)',
                            borderRadius:'0px 0px 20px 20px'}}></div>
            </div>} 
            
            
            <TaleBrush_Canvas_SenVis_Seq mother_this={this.props.mother_this} mother_state={this.props.mother_state} val={val} idx={idx}></TaleBrush_Canvas_SenVis_Seq>
            <TaleBrush_Canvas_Draw_Area_Seq mother_this={this.props.mother_this} mother_state={this.props.mother_state} val={val} idx={idx}></TaleBrush_Canvas_Draw_Area_Seq>
            {/* <div style={{position:'absolute', bottom: '0px', left: '30px', width: 'max-content', color: '#880000', cursor:'default', transformOrigin:'left', transform:'rotate(-90deg)'}}>Bad Fortune</div> */}
            {/* <div style={{position:'absolute', top: '90px', left: '30px', width: 'max-content', color: '#008800', cursor:'default', transformOrigin:'left', transform:'rotate(-90deg)'}}>Good Fortune</div> */}
            {/* <div style={{position:'absolute', top: '0', left: '0', transformOrigin:'left', transform: 'rotate(-90deg)'}}>
                <div style={{position:'absolute', top: '20px', right: '5px', width: 'max-content', color: this.props.mother_state.x_axis_color, cursor:'default'}}>{this.renderXaxis()}</div>
            </div> */}
        </div>)
    }

    renderASurpriseCanvas(){
        var additional = 0
        if(this.props.mother_state.surprise_in_panel){
            additional = 1
        }
        return(<div style={{width:'100%', height: 100/(this.props.mother_state.characters.length+additional)+'%', position:'relative', borderBottom:'solid 5px white'}}>
            <div className='canvas'></div>
            <TaleBrush_Canvas_SenVis_Seq mother_this={this.props.mother_this} mother_state={this.props.mother_state} val={{'_id': '_surprise'}} idx={-1} notrendersent={true}></TaleBrush_Canvas_SenVis_Seq>
            <TaleBrush_Canvas_Draw_Area_Seq mother_this={this.props.mother_this} mother_state={this.props.mother_state} val={{'_id': '_surprise'}} idx={-1}></TaleBrush_Canvas_Draw_Area_Seq>
            <div style={{position:'absolute', bottom: '0px', left: '30px', width: 'max-content', color: '#333333', cursor:'default', transformOrigin:'left', transform:'rotate(-90deg)'}}>Low Suprise</div>
            <div style={{position:'absolute', top: '90px', left: '30px', width: 'max-content', color: '#ff4d00', cursor:'default', transformOrigin:'left', transform:'rotate(-90deg)'}}>High Surprise</div>
        </div>)
    }

    render2DCanvas(){
        return(<div style={{height: '100%', position: 'relative'}}>
            <div className='canvas'></div>
            <TaleBrush_Canvas_SenVis_Att mother_this={this.props.mother_this} mother_state={this.props.mother_state}></TaleBrush_Canvas_SenVis_Att>
            <TaleBrush_Canvas_Draw_Area_Att mother_this={this.props.mother_this} mother_state={this.props.mother_state}></TaleBrush_Canvas_Draw_Area_Att>
            {/* <TaleBrush_Canvas_Draw_Area></TaleBrush_Canvas_Draw_Area> */}
            <div style={{position:'absolute', top: '0', left: '0', transformOrigin:'left', transform: 'rotate(-90deg)'}}>
                <div style={{position:'absolute', top: '20px', right: '5px', width: 'max-content', color: this.props.mother_state.x_axis_color, cursor:'default'}}>{this.renderXaxis()}</div>
            </div>
            {/* {this.props.mother_state.mode_state=='choose_y_axis' && this.renderYaxisChoose()} */}
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

  generate(){
      if(this.props.mother_state.generation_mode=='continuation'){
        this.continuing_generation()
      }else if(this.props.mother_state.generation_mode=='infilling'){
        this.infilling_generation()
      }

  }  

  getNewPathId(){
    var key_list = Object.keys(this.props.mother_state.text_parsed)

    var cur_key = this.props.mother_state.cur_path_id.split('-')

    for(var i in cur_key){
        cur_key[i] = parseInt(cur_key[i])
    }

    var next_candidate= []
    for(var i in key_list){
        key_list[i] = key_list[i].split('-')
        for(var j in key_list[i]){
            key_list[i][j] = parseInt(key_list[i][j])
        }
        var pass = true
        for(var j in cur_key){
            if(cur_key[j]!=key_list[i][j]){
                pass=false
            }
        }
        if(pass && key_list[i].length>cur_key.length){
            next_candidate.push(key_list[i][cur_key.length])
        }
    }
    var nc
    console.log(next_candidate, Math.max(...next_candidate))
    if(next_candidate.length==0){
        nc = 0
    }else{
        nc = Math.max(...next_candidate)+1
    }
    

    return this.props.mother_state.cur_path_id+'-'+nc

    


  }

  insertASentenceToTextbox(idx){
    var text = document.getElementById('textarea').value
    console.log('cur_path_id', this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id], idx)
    var sentence = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][parseInt(idx)]['sentence']
    var split = text.split('\n>')
    var new_text = ''
    for(var i in split){
        if(i == idx){
            if(idx==0){
                new_text = '>'+new_text
            }
            new_text = new_text+sentence
        }else{
            new_text = new_text+split[i]
        }
        if(i!=split.length-1){
            new_text = new_text+'\n>'
        }
    }

    document.getElementById('textarea').value = new_text
    console.log(new_text)
    var _this = this
    this.props.mother_this.setState({text:new_text}, function(){
        _this.props.mother_this.highlightSentence(new_text, _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id])
    })
  }

  continuing_call(pre_context, controls, characters, temperature, new_key, init_idx){
    var _this = this
    if(controls.length==0){
        this.props.mother_this.setState({being_generated:false})
        _this.props.mother_this.storeState('generate_continuation')
        return
    }else{
        var control = controls.shift()
        var temp = temperature.shift()

        /////////// when machine not connecte ////
        var generated = ['generated']
        var values = [Math.random()]
        
        var text_parsed_new = JSON.parse(JSON.stringify(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]))
    
        for(var i in generated){
            i = parseInt(i)
            console.log(i+init_idx+1, i)
            pre_context.push(generated[i])
            text_parsed_new[i+init_idx+1]={
                'sentence': generated[i],
                'protagonist': values[i],
            }
            
            // document.getElementById('sentence_box_'+(i+front_end+1).toString()).value = generated[i]
        }
        _this.props.mother_state.text_parsed[new_key] = text_parsed_new
        console.log('new parsed',_this.props.mother_state.text_parsed)
        _this.props.mother_this.setState({cur_path_id:new_key}, function(){
            _this.insertASentenceToTextbox(init_idx+1)
            _this.continuing_call(pre_context, controls, characters, temperature, new_key, init_idx+1)
        })
        
        
        return
        ///////////


        ///////////////////// Below when machine is connecte
        axios(dl_server+'/continuingGeneration', {
            method: 'POST',
            data: {
                pre_context: JSON.stringify(pre_context),
                controls: JSON.stringify([control]),
                characters: JSON.stringify(characters),
                temperature: JSON.stringify([temp]),
            }
        })
        .then(function(response){
            var generated = JSON.parse(response.data['generated'])
            var values = JSON.parse(response.data['values'])
            
            var text_parsed_new = JSON.parse(JSON.stringify(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]))
        
            for(var i in generated){
                i = parseInt(i)
                console.log(i+init_idx+1, i)
                pre_context.push(generated[i])
                text_parsed_new[i+init_idx+1]={
                    'sentence': generated[i],
                    'protagonist': values[i]/100,
                }
                
                // document.getElementById('sentence_box_'+(i+front_end+1).toString()).value = generated[i]
            }
            _this.props.mother_state.text_parsed[new_key] = text_parsed_new
            console.log(_this.props.mother_state.text_parsed)
            _this.props.mother_this.setState({cur_path_id:new_key}, function(){
                _this.insertASentenceToTextbox(init_idx+1)
                _this.continuing_call(pre_context, controls, characters, temperature, new_key, init_idx+1)
            })
            
            // _this.continuing_call(pre_context, controls, characters, temperature, new_key, init_idx+1)
        })
        ///////////////////////////
    }
    
  }

  

  continuing_generation(){
    var _this = this
    var front_start = this.props.mother_state.text_front_prompt_start
    var front_end = this.props.mother_state.text_front_prompt_end
    var gen_end = this.props.mother_state.text_generation_end
    var pre_context = []
    var controls = []
    var temperature = []
    for(var i=front_start; i<=front_end; i++){
        if(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence']==''){
            alert('Please fill in the context.')
            return
        }
        pre_context.push(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence'])
    }
    for(var i=front_end+1; i<=gen_end; i++){
        if(this.props.mother_state.controls[this.props.mother_state.cur_path_id]['protagonist']!=undefined){
            if (this.props.mother_state.controls[this.props.mother_state.cur_path_id]['protagonist'][i]!=undefined){
                var cval = Math.round(this.props.mother_state.controls[this.props.mother_state.cur_path_id]['protagonist'][i]*100)
                controls.push(cval.toString())
            }else{
                controls.push('-1')
            }
        }else{
            controls.push('-1')
        }
        
        if(this.props.mother_state.controls[this.props.mother_state.cur_path_id]['_surprise']!=undefined){
            if (this.props.mother_state.controls[this.props.mother_state.cur_path_id]['_surprise'][i]!=undefined){
                var sval = 0.9-this.props.mother_state.controls[this.props.mother_state.cur_path_id]['_surprise'][i]*0.6
                temperature.push(sval)
            }else{
                temperature.push(0.9)
            }
        }else{
            temperature.push(0.9)
        }
        
    }
    var characters = [this.props.mother_state.characters[0]['name']]
    // var gen_sen_num = gen_end-front_end
    console.log(this.props.mother_state.controls)
    console.log(pre_context, controls, characters, temperature)

    var new_key = this.getNewPathId()
    this.props.mother_this.setState({
        being_generated: true
    }, function(){
        _this.continuing_call(pre_context, controls, characters, temperature, new_key, front_end)
    })
    
    return


  }

  infilling_call(pre_context, post_context, controls, characters, temperature, new_key, front_idx, back_idx, is_front){
    var _this = this
    if(controls.length==0){
        this.props.mother_this.setState({being_generated:false})
        _this.props.mother_this.storeState('generate_infilling')
        return
    }else{
        var control, temp
        console.log(temperature)
        if(is_front){
            control = controls.shift()
            temp = temperature.shift()
        }else{
            control = controls.pop()
            temp = temperature.pop()
        }


        ////////////////
        var generated = ['generated']
        var values = [Math.random()]
        
        var text_parsed_new = JSON.parse(JSON.stringify(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]))
    
        for(var i in generated){
            i = parseInt(i)
            // console.log(i+init_idx+1, i)
            if(is_front){
                pre_context.push(generated[i])
                text_parsed_new[i+front_idx+1]={
                    'sentence': generated[i],
                    'protagonist': values[i],
                }
            }else{
                post_context.unshift(generated[i])
                text_parsed_new[back_idx-generated.length+i]={
                    'sentence': generated[i],
                    'protagonist': values[i],
                }
            }
            
            
            // document.getElementById('sentence_box_'+(i+front_end+1).toString()).value = generated[i]
        }
        _this.props.mother_state.text_parsed[new_key] = text_parsed_new
        // console.log('1',_this.props.mother_state.text_parsed)
        _this.props.mother_this.setState({cur_path_id:new_key}, function(){
            if(is_front){
                _this.insertASentenceToTextbox(front_idx+1)
                _this.infilling_call(pre_context, post_context, controls, characters, temperature, new_key, front_idx+1, back_idx, !is_front)
            }else{
                _this.insertASentenceToTextbox(back_idx-1)
                _this.infilling_call(pre_context, post_context, controls, characters, temperature, new_key, front_idx, back_idx-1, !is_front)
            }
        })
        return
        
        ////////////////


        ////////////////////////////// When connected to a machine, below
        axios(dl_server+'/infillingGeneration', {
            method: 'POST',
            data: {
                pre_context: JSON.stringify(pre_context),
                post_context: JSON.stringify(post_context),
                controls: JSON.stringify([control]),
                characters: JSON.stringify(characters),
                temperature: JSON.stringify([temp]),
                is_front: is_front
            }
        })
        .then(function(response){
            var generated = JSON.parse(response.data['generated'])
            var values = JSON.parse(response.data['values'])
            
            var text_parsed_new = JSON.parse(JSON.stringify(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]))
        
            for(var i in generated){
                i = parseInt(i)
                // console.log(i+init_idx+1, i)
                if(is_front){
                    pre_context.push(generated[i])
                    text_parsed_new[i+front_idx+1]={
                        'sentence': generated[i],
                        'protagonist': values[i]/100,
                    }
                }else{
                    post_context.unshift(generated[i])
                    text_parsed_new[back_idx-generated.length+i]={
                        'sentence': generated[i],
                        'protagonist': values[i]/100,
                    }
                }
                
                
                // document.getElementById('sentence_box_'+(i+front_end+1).toString()).value = generated[i]
            }
            _this.props.mother_state.text_parsed[new_key] = text_parsed_new
            console.log('1',_this.props.mother_state.text_parsed)
            _this.props.mother_this.setState({cur_path_id:new_key}, function(){
                if(is_front){
                    _this.insertASentenceToTextbox(front_idx+1)
                    _this.infilling_call(pre_context, post_context, controls, characters, temperature, new_key, front_idx+1, back_idx, !is_front)
                }else{
                    _this.insertASentenceToTextbox(back_idx-1)
                    _this.infilling_call(pre_context, post_context, controls, characters, temperature, new_key, front_idx, back_idx-1, !is_front)
                }
                
            })
            
        })
        ////////////////////////
    }
  }

  infilling_generation(){
    var _this = this
    var front_start = this.props.mother_state.text_front_prompt_start
    var front_end = this.props.mother_state.text_front_prompt_end

    var back_start = this.props.mother_state.text_back_prompt_start
    var back_end = this.props.mother_state.text_back_prompt_end

    var pre_context = []
    var post_context = []
    var controls = []
    var temperature = []
    for(var i=front_start; i<=front_end; i++){
        if(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence']==''){
            alert('Please fill in the context.')
            return
        }
        pre_context.push(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence'])
    }
    for(var i=back_start; i<=back_end; i++){
        if(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence']==''){
            alert('Please fill in the context.')
            return
        }
        post_context.push(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence'])
    }
    for(var i=front_end+1; i<back_start; i++){
        if(this.props.mother_state.controls[this.props.mother_state.cur_path_id]['protagonist']!=undefined){
            if (this.props.mother_state.controls[this.props.mother_state.cur_path_id]['protagonist'][i]!=undefined){
                var cval = Math.round(this.props.mother_state.controls[this.props.mother_state.cur_path_id]['protagonist'][i]*100)
                controls.push(cval.toString())
            }else{
                controls.push('-1')
            }
        }else{
            controls.push('-1')
        }

        if(this.props.mother_state.controls[this.props.mother_state.cur_path_id]['_surprise']!=undefined){
            if (this.props.mother_state.controls[this.props.mother_state.cur_path_id]['_surprise'][i]!=undefined){
                var sval = 0.9-this.props.mother_state.controls[this.props.mother_state.cur_path_id]['_surprise'][i]*0.6
                temperature.push(sval)
            }else{
                temperature.push(0.9)
            }
        }else{
            temperature.push(0.9)
        }
    }
    var characters = [this.props.mother_state.characters[0]['name']]
    // var gen_sen_num = back_start-front_end-1
    console.log(this.props.mother_state.controls)
    console.log(pre_context, post_context, controls, characters, temperature)

    // // when machine is not connected////////////
    var new_key = this.getNewPathId()
    this.props.mother_this.setState({
        being_generated: true
    }, function(){
        _this.infilling_call(pre_context, post_context, controls, characters, temperature, new_key, front_end, back_start, is_front)
    })
    return
    ////////////////////////////////////////////


    var is_front = true
    if(pre_context.length>post_context.length){
        is_front = false
    }

    var new_key = this.getNewPathId()
    this.props.mother_this.setState({
        being_generated: true
    }, function(){
        _this.infilling_call(pre_context, post_context, controls, characters, temperature, new_key, front_end, back_start, is_front)
    })
    
    return
    

  }

  changeCharacterName(idx, e){
    if(this.props.mother_state.being_generated==false){
    //   var charactername = prompt(idx)
    // console.log(idx, e)
      this.props.mother_state.characters[idx]['name'] = e.target.value
      this.props.mother_this.setState({})
    }
    
  }

  reviseCharacterName(idx, e){
    if(this.props.mother_state.being_generated==false){
    //   var charactername = prompt(idx)
    console.log(idx, e)
      this.props.mother_state.characters[idx]['name'] = e.target.value
      this.props.mother_this.storeState('change_protagonist_name')
      this.props.mother_this.setState({})
    }
    
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
                <div id='protagonist_container' 
                    style={{
                        display: 'inline-block', verticalAlign:'middle', 
                        height: '36px', width:'108px',
                        border: '1.2px solid', borderRadius:'8px', padding:'4px 10px 4px 10px'}}>
                    
                    <input type='text' id='protagonist_input' 
                    placeholder='Protagonist' spellCheck='false'
                    style={{
                        display:'inline-block', minWidth:'50px', 
                        textAlign:'left', content:'attr(placeholder)',
                        border: 'none', backgroundColor:'transparent', resize: 'none', overflow:'visible', 
                        fontFamily: 'Spoqa Han Sans Neo', fontSize: '15.6px', fontWeight: '400', 
                        lineHeight: '140%', color: 'rgba(10, 10, 10, 0.80)',
                        marginTop:'2px', height: '20px'
                        }}

                    value = {this.props.mother_state.characters[0]['name']}
                    onInput={(event) =>{
                        var l =(document.getElementById("protagonist_input").offsetWidth);
                        document.getElementById("protagonist_container").style.width= (l+22)+'px';
                        // console.log(l);
                    }}
                    onChange={this.changeCharacterName.bind(this, 0)}
                    onBlur={this.reviseCharacterName.bind(this, 0)}
                    disabled = {this.props.mother_state.being_generated}
                    ></input>

                </div> 
                <div style={{
                    display:'inline-block', position:'absolute',
                    fontFamily: 'Spoqa Han Sans Neo', fontSize: '15.6px', fontWeight: '400', 
                    color: 'rgba(10, 10, 10, 0.80)',
                    marginLeft:'6px', marginTop:'5px'
                    }}> 's fortune
                </div>  
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
                    
                    {this.props.mother_state.x_axis==-1 && this.renderSequenceCanvases()}
                    {this.props.mother_state.x_axis==-1 && this.props.mother_state.surprise_in_panel && this.renderASurpriseCanvas()}
                    {/* {this.props.mother_state.x_axis!=-1 && this.render2DCanvas()} */}


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
                    {this.props.mother_state.x_axis==-1 && <div style={{marginRight: '10px'}}>
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