// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';
// import {continuing_generation, infilling_generation} from './TaleBrush_Generate'

export default class TaleBrush_Canvas_Draw_Area_Seq extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timer_function: undefined,
    };
  }

  SeqDrawBegin(e){
    if(this.props.mother_state.being_generated){
      return
    }
    if(this.props.mother_state.characters[0]['name']==''){
      alert("Please first specify the protagonist's name.")
      return
    }
      var _this = this
      console.log(this.props.val['_id'])
      // console.log(e.pageX-document.getElementById('drawer_'+this.props.val['_id']).offsetLeft)
      // console.log(document.getElementById('drawer_'+this.props.val['_id']).getBoundingClientRect().top)
      // console.log(e.pageY-document.getElementById('drawer_'+this.props.val['_id']).getBoundingClientRect().top)
      e.stopPropagation();
      if(this.props.mother_state.mode_state=='idle'){
        
        if(this.props.val['_id']!='_surprise'){
          this.props.mother_state.original_controls = {}
          this.props.mother_state.added_control_ids = []
        }
        
        this.props.mother_state.old_controls = JSON.parse(JSON.stringify(this.props.mother_state.controls[this.props.mother_state.cur_path_id]))
        var x = (e.pageX-document.getElementById('drawer_'+this.props.val['_id']).getBoundingClientRect().left)/document.getElementById('drawer_'+this.props.val['_id']).offsetWidth
        var y = 1-(e.pageY-document.getElementById('drawer_'+this.props.val['_id']).getBoundingClientRect().top)/document.getElementById('drawer_'+this.props.val['_id']).offsetHeight
        this.props.mother_this.setState({mode_state: 'seq_draw', seq_draw_char: this.props.val['_id'], seq_draw_prev_pos: [x, y], seq_draw_prev_time: Date.now(), accum_time:0, accum_dist:0})
      }
  }


  SeqDraw(e){
    e.stopPropagation();
    var val = this.props.val
    var x = (e.pageX-document.getElementById('drawer_'+this.props.val['_id']).getBoundingClientRect().left)/document.getElementById('drawer_'+this.props.val['_id']).offsetWidth
    var cx = x*this.props.mother_state.total_length

    var _this = this
    this.props.mother_this.setState({sent_highlighted_mouse: Math.round(cx)}, function(){
      _this.props.mother_this.highlightSentence(_this.props.mother_state.text, _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id])
    })
    // this.props.mother_this.setState({sent_highlighted: Math.round(cx)})
    
    if(this.props.mother_state.mode_state=='seq_draw' && this.props.mother_state.seq_draw_char==this.props.val['_id']){
      var y = 1-(e.pageY-document.getElementById('drawer_'+this.props.val['_id']).getBoundingClientRect().top)/document.getElementById('drawer_'+this.props.val['_id']).offsetHeight
      // if(x>this.props.mother_state.text_prompt_range/this.props.mother_state.total_length){
        
        var px = this.props.mother_state.seq_draw_prev_pos[0]*this.props.mother_state.total_length
        var py = this.props.mother_state.seq_draw_prev_pos[1]//*this.props.mother_state.total_length
        var now = Date.now()
        var t = now - this.props.mother_state.seq_draw_prev_time 
        var dist = Math.sqrt(((px-cx)/this.props.mother_state.total_length)*((px-cx)/this.props.mother_state.total_length)+(py-y)*(py-y))
        
        var cy = y//*this.props.mother_state.total_length
        var accum_dist = this.props.mother_state.accum_dist+dist
        var accum_time = this.props.mother_state.accum_time+t
        // console.log(px/this.props.mother_state.total_length, py)

        for(var i=0; i<this.props.mother_state.total_length; i++){
          if((cx>i-0.5 && px<i+0.5)||(cx<i+0.5 && px>i-0.5)){
            // console.log(x, y)
            if(this.props.mother_state.added_control_ids.indexOf(i)==-1&& val['_id']!='_surprise'){
              this.props.mother_state.added_control_ids.push(i)
            }
            
            if(this.props.mother_state.original_controls[i]==undefined && val['_id']!='_surprise'){
                this.props.mother_state.original_controls[i] = [this.props.mother_state.controls[this.props.mother_state.cur_path_id][val['_id']][i], this.props.mother_state.controls[this.props.mother_state.cur_path_id]['_regeneration'][i]]
            }
            if(this.props.mother_state.action_state=='brush'){
              var y_val = (py+cy)/2
              if(this.props.mother_state.controls[this.props.mother_state.cur_path_id][val['_id']]==undefined){
                this.props.mother_state.controls[this.props.mother_state.cur_path_id][val['_id']]={}
                if(this.props.mother_state.controls[this.props.mother_state.cur_path_id]['_regeneration']==undefined){
                  this.props.mother_state.controls[this.props.mother_state.cur_path_id]['_regeneration']={}
                }
                
              }
              this.props.mother_state.controls[this.props.mother_state.cur_path_id][val['_id']][i]=y_val

              
              var vel = accum_dist/accum_time
              if(val['_id']!='_surprise'){
                if(1/vel>3000){
                  this.props.mother_state.controls[this.props.mother_state.cur_path_id]['_regeneration'][i]=2
                  // console.log(3)
                }
                // else if(1/vel>3000){
                //   this.props.mother_state.controls['_regeneration'][i]=2
                //   console.log(2)
                // }
                else{ 
                  this.props.mother_state.controls[this.props.mother_state.cur_path_id]['_regeneration'][i]=1/vel/3000+1
                  // console.log(1)
                }
              }
              accum_dist=0
              accum_time=0
              
              break
            }else if(this.props.mother_state.action_state=='erase'){
              var y_val = (py+cy)/2
              if(this.props.mother_state.controls[this.props.mother_state.cur_path_id][val['_id']]!=undefined){
                if(this.props.mother_state.controls[this.props.mother_state.cur_path_id][val['_id']][i]!=undefined){
                  // if(Math.abs(y_val-this.props.mother_state.controls[this.props.mother_state.cur_path_id][val['_id']][i])<0.075){
                    delete this.props.mother_state.controls[this.props.mother_state.cur_path_id][val['_id']][i]
                  // }
                }
              }
              break
            }
            
          }
        }
        // console.log(this.props.mother_state.controls[val['_id']])
        this.props.mother_this.setState({seq_draw_prev_pos: [x, y], seq_draw_prev_time: now, accum_dist:accum_dist, accum_time:accum_time})
      // }
      
    }
  }

  // SeqDraw(e){
  //   e.stopPropagation();
  //   var val = this.props.val
  //   var x = (e.pageX-document.getElementById('drawer_'+this.props.val['_id']).getBoundingClientRect().left)/document.getElementById('drawer_'+this.props.val['_id']).offsetWidth
  //   //*this.props.mother_state.total_length
  //   var y = 1-(e.pageY-document.getElementById('drawer_'+this.props.val['_id']).getBoundingClientRect().top)/document.getElementById('drawer_'+this.props.val['_id']).offsetHeight
    
  //   x = x*this.props.mother_state.total_length
  //   var _this = this
  //   this.props.mother_this.setState({sent_highlighted_mouse: Math.round(x)}, function(){
  //     _this.props.mother_this.highlightSentence(_this.props.mother_state.text, _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id])
  //   })
    
  //   if(this.props.mother_state.mode_state=='seq_draw' && this.props.mother_state.seq_draw_char==this.props.val['_id']){
  //     if(this.props.mother_state.action_state=='brush'){
  //       this.props.mother_state.controls[this.props.val['_id']][this.props.mother_state.controls[this.props.val['_id']].length-1].push([x,y])
  //       var cur_time = Date.now()
  //       // if(cur_time-this.props.mother_state.seq_draw_prev_time>100){
  //       //   console.log(cur_time-this.props.mother_state.seq_draw_prev_time)
  //       // }
  //       this.props.mother_state.control_times[this.props.val['_id']][this.props.mother_state.control_times[this.props.val['_id']].length-1].push(cur_time-this.props.mother_state.seq_draw_prev_time)
  //       this.props.mother_this.setState({seq_draw_prev_time: cur_time})
  //     }else if(this.props.mother_state.action_state=='erase' && this.props.mother_state.seq_draw_char==this.props.val['_id']){
  //       // console.log('e')
  //       var new_controls = []
  //       var new_control_times = []
  //       var controls = this.props.mother_state.controls[this.props.val['_id']]
  //       var control_times = this.props.mother_state.control_times[this.props.val['_id']]
  //       for(var idx1 in controls){
  //         var control = controls[idx1]
  //         var control_time = control_times[idx1]
  //         var new_control = []
  //         var new_control_time = []
  //         for(var idx2 in control){
  //           var point = control[idx2]
  //           var ct = control_time[idx2]
            
  //           var dist_x = (point[0]-x)/this.props.mother_state.total_length
  //           var dist_y = point[1]-y
  //           if(Math.sqrt(dist_x*dist_x+dist_y*dist_y)>0.02){
              
  //             new_control.push(point.slice())
  //             new_control_time.push(ct)
  //           }else{
  //             if(new_control.length>1){
  //               new_controls.push(new_control.slice())
  //               new_control_times.push(new_control_time.slice())
  //             }
  //             new_control=[]
  //             new_control_time = []
  //           }
  //         }
  //         if(new_control.length>1){
  //           new_controls.push(new_control.slice())
  //           new_control_times.push(new_control_time.slice())
  //         }


  //       }
        
  //       this.props.mother_state.controls[this.props.val['_id']] = new_controls
  //       this.props.mother_state.control_times[this.props.val['_id']] = new_control_times
  //       this.props.mother_this.setState({})
  //     }
      
  //   }
  // }

  SeqDrawEnd(e){
      if(this.props.mother_state.mode_state=='seq_draw'){
        this.props.mother_this.generate(this)
      //     var _this = this
      //     // this.props.mother_this.storeState('control_drawing')
      //     this.props.mother_this.setState({mode_state: 'idle'}, function(){
      //       _this.props.mother_state.added_control_ids.sort()
      //       var text_parsed= _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]
      //       console.log(text_parsed)
      //       var min = Math.min(..._this.props.mother_state.added_control_ids)
      //       var max = Math.max(..._this.props.mother_state.added_control_ids)
      //       console.log(min, max)
      //       var pre_context = []
      //       var post_context = []
      //       var pre_gap_count = 0
      //       var post_gap_count = 0
      //       if(min==Infinity || max==Infinity){
      //         return
      //       }
      //       for(var i=min-1; i>=0; i--){
      //         if(text_parsed[i.toString()]==undefined){
      //           pre_gap_count++
      //         }else if(text_parsed[i.toString()]['sentence']!=''){
      //           pre_context.unshift(i)
      //         }else if(text_parsed[i.toString()]['sentence']=='' && pre_context.length>0){
      //           break
      //         }else{
      //           pre_gap_count++
      //         }
      //       }
      //       for(var i=max+1; i<_this.props.mother_state.total_length; i++){
      //         if(text_parsed[i.toString()]==undefined){
      //           post_gap_count++
      //         }else if(text_parsed[i.toString()]['sentence']!=''){
      //           post_context.push(i)
      //         }else if(text_parsed[i.toString()]['sentence']=='' && post_context.length>0){
      //           break
      //         }else{
      //           post_gap_count++
      //         }
      //       }
      //       console.log(pre_context, post_context, pre_gap_count, post_gap_count)
      //       if(_this.props.val['_id']=='_surprise'){
      //         return
      //       }
      //       if(pre_context.length>0 || post_context.length>0){
      //         if(pre_context.length>0 && pre_gap_count==0 && post_context.length==0){
      //           // Continuation
      //           console.log('continuation')
      //           continuing_generation(_this, Math.min(...pre_context), Math.max(...pre_context), max)

      //         }else if(pre_context.length>0 && pre_gap_count>0 && post_context.length==0){
      //           // Continuation
      //           console.log('continuation')
      //           var pick_ids = []
      //           for(var i = min; i<=max; i++){
      //             pick_ids.push(i)
      //           }
      //           continuing_generation(_this, Math.min(...pre_context), Math.max(...pre_context), max, pick_ids)
      //         }else if(pre_context.length>=0 && post_context.length>0 && pre_gap_count==0 && post_gap_count==0){
      //           // Traditional Infill
      //           console.log('traditional infill')
      //           var pre_min, pre_max
      //           if(pre_context.length==0){
      //             pre_min = 0
      //             pre_max = -1
      //           }else{
      //             pre_min = Math.min(...pre_context)
      //             pre_max = Math.max(...pre_context)
      //           }
      //           infilling_generation(_this, pre_min, pre_max,  Math.min(...post_context), Math.max(...post_context))
      //         }else if(pre_context.length>=0 && post_context.length>0 && pre_gap_count==0 && post_gap_count>0){
      //           // Infill from front
      //           console.log('infill from front')
      //           var pick_ids = []
      //           for(var i = min; i<=max; i++){
      //             pick_ids.push(i)
      //           }
      //           var pre_min, pre_max
      //           if(pre_context.length==0){
      //             pre_min = 0
      //             pre_max = -1
      //           }else{
      //             pre_min = Math.min(...pre_context)
      //             pre_max = Math.max(...pre_context)
      //           }
      //           console.log(pick_ids)
      //           infilling_generation(_this, pre_min, pre_max,  Math.min(...post_context), Math.max(...post_context), pick_ids)
      //         }else if(pre_context.length>=0 && post_context.length>0 && pre_gap_count>0 && post_gap_count==0){
      //           // Infill from back
      //           console.log('infill from back')
      //           var pick_ids = []
      //           for(var i = min; i<=max; i++){
      //             pick_ids.push(i)
      //           }
      //           var pre_min, pre_max
      //           if(pre_context.length==0){
      //             pre_min = 0
      //             pre_max = -1
      //           }else{
      //             pre_min = Math.min(...pre_context)
      //             pre_max = Math.max(...pre_context)
      //           }
      //           infilling_generation(_this, pre_min, pre_max,  Math.min(...post_context), Math.max(...post_context), pick_ids)
      //         }else if(pre_context.length>=0 && post_context.length>0 && pre_gap_count>0 && post_gap_count>0){
      //           // Traditional Infill
      //           console.log('infill in the middle')
      //           var pick_ids = []
      //           for(var i = min; i<=max; i++){
      //             pick_ids.push(i)
      //           }
      //           console.log(pick_ids)
      //           var pre_min, pre_max
      //           if(pre_context.length==0){
      //             pre_min = 0
      //             pre_max = -1
      //           }else{
      //             pre_min = Math.min(...pre_context)
      //             pre_max = Math.max(...pre_context)
      //           }
      //           infilling_generation(_this, pre_min, pre_max,  Math.min(...post_context), Math.max(...post_context), pick_ids)
      //         }

      //       }else{
      //         alert('No context is given to generate story!')
      //         // TODO handle this situation
      //         var original_controls = _this.props.mother_state.original_controls
              
      //         var added_control_ids = _this.props.mother_state.added_control_ids

      //         console.log('no context', original_controls, added_control_ids)
      //         for(var i in added_control_ids){
      //           if(original_controls[added_control_ids[i]][0]==undefined){
      //             delete _this.props.mother_state.controls[_this.props.mother_state.cur_path_id][_this.props.val['_id']][added_control_ids[i]]
      //             delete _this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_regeneration'][added_control_ids[i]]
      //           }else{
      //             // 해결해라...
      //             _this.props.mother_state.controls[_this.props.mother_state.cur_path_id][_this.props.val['_id']][added_control_ids[i]] = original_controls[added_control_ids[i]][0]
      //             _this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_regeneration'][added_control_ids[i]] = original_controls[added_control_ids[i]][1]
      //           }
                
      //         }
      //         _this.props.mother_this.setState({original_controls:{}})
      //       }
      //     })
          
      }
  }
  dehighlightSent(){
    var _this = this
    if(this.props.mother_state.mode_state=='seq_draw'){
      this.props.mother_this.generate(this)
    }
    this.props.mother_this.setState({sent_highlighted_mouse: -1}, function(){
      _this.props.mother_this.highlightSentence(_this.props.mother_state.text, _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id])
    })
  }

  render() {
    return (
        <div id={'drawer_'+this.props.val['_id']} className='canvas' style={{backgroundColor:'transparent'}} 
        onPointerDown={this.SeqDrawBegin.bind(this)} onPointerMove={this.SeqDraw.bind(this)} onPointerUp={this.SeqDrawEnd.bind(this)}
        onPointerOut={this.dehighlightSent.bind(this)}>

        </div>
    )
  }
}