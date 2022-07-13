// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';
import rough from 'roughjs';


export default class TaleBrush_Canvas_SenVis_Seq extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      control_color_new: '#7AE1AC',
      control_color: '#0F924E',//'#b4edcf',//'#80F0B4',
      control_range_opacity: '0.1',
      control_range_width: 11, 
      control_range_width2: 8, 
      control_width: 0.35, 

      generated_width: 0.5,
      generated_color: '#999795', //'#ceddf0',//'#b9d2f0',
      generated_color_new: '#54A0F8', 

    }
  }
  
  componentDidMount(){
    console.log(document.getElementById('whole_canvas'))
    var generator = rough.generator({},{width:document.getElementById('whole_canvas').getBoundingClientRect().width, height:document.getElementById('whole_canvas').getBoundingClientRect().height})
    this.setState({generator})
    var _this = this
    window.onresize=function(){
      var generator = rough.generator({},{width:document.getElementById('whole_canvas').getBoundingClientRect().width, height:document.getElementById('whole_canvas').getBoundingClientRect().height})
      _this.setState({generator})
    }
    // var svg = document.getElementById('control_svg')
    // var rc = rough.svg(svg)
    // svg.appendChild(rc.line(0, 0, 50, 50, {
    //   stroke:'url(#grad_control)'
    // }))
  }

  renderControlsBezier(path_id){
    if(this.props.val['_id']!='_surprise'){
      var color1, color2
      if(path_id == this.props.mother_state.cur_path_id){
        color1 = 'url(#grad_control)'
        color2 = 'url(#grad_control_area)'
      }else{
        color1 = this.state.control_color
        color2 = this.state.control_color
      }
      return (<g>
        {this.renderBezierRange(this.props.mother_state.controls[path_id][this.props.val._id], this.props.mother_state.controls[path_id]['_regeneration'], 1, color2, 0.5, path_id+'_control')}
        {/* {this.renderBezier(this.props.mother_state.controls[path_id][this.props.val._id], this.state.control_width, color1, 1)} */}
      </g>)
    }else{
      return (<g>
        {this.renderBezier(this.props.mother_state.controls[path_id][this.props.val._id], this.state.control_width, this.state.control_color, 1, path_id+'_surprise')}
      </g>)
    }

    
  }

  renderGeneratedBezier(path_id){
    var text_parsed = this.props.mother_state.text_parsed[path_id]
    var control = {}
    for(var i in text_parsed){
      if(text_parsed[i][this.props.val._id]!=undefined){
        control[i] = text_parsed[i][this.props.val._id]
      }
      
    }
    var color
    if(path_id==this.props.mother_state.cur_path_id){
      color = 'url(#grad_control2)'
    }else{
      color = this.state.generated_color
    }
    // console.log(control)
    return (<g>{this.renderBezier(control, this.state.generated_width, color, 1, path_id+'_generated')}</g>)
  }

  renderBezier(control, width ='1', color='black', opacity = 1, _id=''){
    
    
    
    if(document.getElementById('whole_canvas')!=undefined){
      // var generator = rough.generator({},{width:document.getElementById('whole_canvas').getBoundingClientRect().width, height:document.getElementById('whole_canvas').getBoundingClientRect().height})
      
      if(control==undefined){
        return
      }
      // console.log(control)
      var control_keys = Object.keys(control)
  
      // console.log('control keys again??', control_keys)
      var path ='M '
      // console.log(control_keys)
      for(var i in control_keys){
        i = parseInt(i)
        path = path + (control_keys[i]*100/this.props.mother_state.total_length).toString()+' '+((1-control[control_keys[i]])*100).toString()+' '
        // console.log(control_keys[i]+1, control_keys.indexOf(parseInt(control_keys[i])+1))
        if(control_keys.indexOf((parseInt(control_keys[i])+1).toString())==-1 && i!=control_keys.length-1){
          path = path + ' M'
        }else if(i!=control_keys.length-1){
          // add curvature
  
          // check if previous exists
          var prev_key = (parseInt(control_keys[i])-1).toString()
          var x1, y1, x2, y2
          // console.log(control_keys.indexOf(prev_key)!=-1)
          if(control_keys.indexOf(prev_key)!=-1){
            var dx = 2*100/this.props.mother_state.total_length
            var dy = (1-control[control_keys[i+1]]*100) - (1-control[control_keys[i-1]]*100)
            x1 = dx/4+ parseInt(control_keys[i])*100/this.props.mother_state.total_length
            y1 = dy/4 + (1-control[control_keys[i]])*100
            x1 = x1.toString()
            y1 = y1.toString()
          }else{
            // console.log((control_keys[i+1]*100/this.props.mother_state.total_length).toString())
            x1 = ((parseInt(control_keys[i])+1)*100/this.props.mother_state.total_length).toString()
            y1 = ((1-control[control_keys[i+1]])*100).toString()
            // console.log(control, control_keys[i+1], control_keys, i+1)
          }
  
          var next_key = (parseInt(control_keys[i])+2).toString()
          if(control_keys.indexOf(next_key)!=-1){
            var dx = -2*100/this.props.mother_state.total_length
            var dy = (1-control[control_keys[i]]*100) - (1-control[control_keys[i+2]]*100)
            x2 = dx/4+ parseInt(control_keys[i+1])*100/this.props.mother_state.total_length
            y2 = dy/4 + (1-control[control_keys[i+1]])*100
  
            x2 = x2.toString()
            y2 = y2.toString()
          }else{
            x2 = (parseInt(control_keys[i])*100/this.props.mother_state.total_length).toString()
            y2 = ((1-control[control_keys[i]])*100).toString()
            
          }
          
          path = path + 'C '+x1+' '+y1+' '+x2+' '+y2+' '
        }
      }
      
      if(path!='M '){
        var generator = this.state.generator
        if(generator!=undefined){
          var p_obj = generator.path(path, {'roughness': 0.4})
          var p = generator.toPaths(p_obj)
          return (<path id={_id} d={p[0]['d']} stroke={color} strokeWidth={width} strokeOpacity={opacity} strokeLinecap="round" fill="transparent"></path>)
        }
        
      }
      
      
    }
    return
    
    
  }


  renderBezierRange(control, control_regen, width ='1', color='black', opacity = 1){
    if(control==undefined){
      return
    }
    if(document.getElementById('whole_canvas')!=undefined){
      // var generator = rough.generator({},{width:document.getElementById('whole_canvas').getBoundingClientRect().width, height:document.getElementById('whole_canvas').getBoundingClientRect().height})
      var generator = this.state.generator
      // console.log(control)
      var control_keyss = Object.keys(control)
      var control_regen_keys = Object.keys(control_regen)
      // var path ='M '
      // console.log(control_keys)
      var control_groups = [[]]
      // console.log('control keys', control_keys)
      for(var i in control_keyss){
        i=parseInt(i)
        var key = parseInt(control_keyss[i])
        control_groups[control_groups.length-1].push(key)
        if(i!=control_keyss.length-1){
          if(key+1!=parseInt(control_keyss[i+1])){
            control_groups.push([])
          }
        }
      }

      
      return control_groups.map((val, idx)=>{
        var control_keys = control_groups[idx]
        var path = 'M '
        for(var i=0; i<control_keys.length; i++){
          i = parseInt(i)
          var add_val = this.state.control_range_width2*(control_regen[control_keys[i]]-1)+this.state.control_range_width*(2-control_regen[control_keys[i]])
          if(i==0){
            path = path + ((control_keys[i]-0.5)*100/this.props.mother_state.total_length).toString()
            if(control_keys.length>1){
              path = path + ' '+ ((1-2*control[control_keys[i]]+control[control_keys[i+1]])*100+add_val).toString() +' '
              path = path+ 'C '+(control_keys[i]*100/this.props.mother_state.total_length).toString()+' '+((1-control[control_keys[i]])*100+add_val).toString()+' '
              path = path +((control_keys[i]-0.5)*100/this.props.mother_state.total_length).toString()+ ' '+ ((1-2*control[control_keys[i]]+control[control_keys[i+1]])*100+add_val).toString()+' '
            }else{
              path = path + ' '+ ((1-control[control_keys[i]])*100+add_val).toString() +' '
              path = path+ 'C '+(control_keys[i]*100/this.props.mother_state.total_length).toString()+' '+((1-control[control_keys[i]])*100+add_val).toString()+' '
              path = path +((control_keys[i]-0.5)*100/this.props.mother_state.total_length).toString()+ ' '+ ((1-control[control_keys[i]])*100+add_val).toString()+' '
            }

          }
          path = path + (control_keys[i]*100/this.props.mother_state.total_length).toString()+' '+((1-control[control_keys[i]])*100+add_val).toString()+' '
          
            // add curvature

            // check if previous exists
            var prev_key = parseInt(control_keys[i])-1
            var x1, y1, x2, y2
            if(i==control_keys.length-1){
              if(control_keys.length>1){
                x1 = ((control_keys[i]+0.5)*100/this.props.mother_state.total_length).toString()
                y1 = ((1-2*control[control_keys[i]]+control[control_keys[i-1]])*100+add_val).toString()
              }else{
                x1 = ((control_keys[i]+0.5)*100/this.props.mother_state.total_length)
                y1 = ((1-control[control_keys[i]])*100+add_val).toString()
              }
              // x1 = (parseInt(control_keys[i]+0.5)*100/this.props.mother_state.total_length).toString()
              // y1 = ((1-control[control_keys[i]])*100+add_val).toString()
            }else{
              if(control_keys.indexOf(prev_key)!=-1){
                var dx = 2*100/this.props.mother_state.total_length
                var dy = (1-control[control_keys[i+1]]*100) - (1-control[control_keys[i-1]]*100)
                x1 = dx/4+ parseInt(control_keys[i])*100/this.props.mother_state.total_length
                y1 = dy/4 + (1-control[control_keys[i]])*100+add_val
                x1 = x1.toString()
                y1 = y1.toString()
              }else{
                // console.log((control_keys[i+1]*100/this.props.mother_state.total_length).toString())
                x1 = ((parseInt(control_keys[i])+1)*100/this.props.mother_state.total_length).toString()
                y1 = ((1-control[control_keys[i+1]])*100+add_val).toString()
                // console.log(control, control_keys[i+1], control_keys, i+1)
              }
            }
            



            var next_key = parseInt(control_keys[i])+2

            if(i==control_keys.length-1){
              if(control_keys.length>1){
                x2 = (control_keys[i]*100/this.props.mother_state.total_length).toString()
                y2 = ((1-control[control_keys[i]])*100+add_val).toString()
              }else{
                x2 = (control_keys[i]*100/this.props.mother_state.total_length).toString()
                y2 = ((1-control[control_keys[i]])*100+add_val).toString()
              }
              // x2 = (parseInt(control_keys[i])*100/this.props.mother_state.total_length).toString()
              // y2 = ((1-control[control_keys[i]])*100+add_val).toString()
            }else{
              if(control_keys.indexOf(next_key)!=-1){
                var dx = -2*100/this.props.mother_state.total_length
                var dy = (1-control[control_keys[i]]*100) - (1-control[control_keys[i+2]]*100)
                x2 = dx/4+ parseInt(control_keys[i+1])*100/this.props.mother_state.total_length
                y2 = dy/4 + (1-control[control_keys[i+1]])*100+add_val
    
                x2 = x2.toString()
                y2 = y2.toString()
              }else{
                x2 = (parseInt(control_keys[i])*100/this.props.mother_state.total_length).toString()
                y2 = ((1-control[control_keys[i]])*100+add_val).toString()
                
              }
            }
            
            
            path = path + 'C '+x1+' '+y1+' '+x2+' '+y2+' '

            
        }

        if(control_keys.length>1){
          var i = control_keys.length-1
          path = path + x1+' '+y1+' '
          path = path +'C '+x1 +' '+ ((1-2*control[control_keys[i]]+control[control_keys[i-1]])*100-add_val).toString()
          path = path +' '+x1 +' '+ y1+' '
          path = path + x1 +' '+((1-2*control[control_keys[i]]+control[control_keys[i-1]])*100-add_val).toString()+' '
          path=path+'C '+x2+' '+((1-control[control_keys[i]])*100-add_val).toString()+' '
          path = path + x1 +' '+((1-2*control[control_keys[i]]+control[control_keys[i-1]])*100-add_val).toString()+' '
        }else{
          var i = control_keys.length-1
          path = path + x1+' '+y1+' '
          path = path +'C '+x1 +' '+ ((1-control[control_keys[i]])*100-add_val).toString()
          path = path +' '+x1 +' '+ y1+' '
          path = path + x1 +' '+((1-control[control_keys[i]])*100-add_val).toString()+' '
          path=path+'C '+x2+' '+((1-control[control_keys[i]])*100-add_val).toString()+' '
          path = path + x1 +' '+((1-control[control_keys[i]])*100-add_val).toString()+' '
        }

        for(var i=control_keys.length-1; i>=0; i--){
          i = parseInt(i)
          var add_val = this.state.control_range_width2*(control_regen[control_keys[i]]-1)+this.state.control_range_width*(2-control_regen[control_keys[i]])

          path = path + (control_keys[i]*100/this.props.mother_state.total_length).toString()+' '+((1-control[control_keys[i]])*100-add_val).toString()+' '
          if(i!=0){
            
          
            // add curvature

            // check if previous exists
            var prev_key = parseInt(control_keys[i])+1
            var x1, y1, x2, y2
            
            if(control_keys.indexOf(prev_key)!=-1){
              var dx = -2*100/this.props.mother_state.total_length
              var dy = (1-control[control_keys[i-1]]*100) - (1-control[control_keys[i+1]]*100)
              x1 = dx/4+ parseInt(control_keys[i])*100/this.props.mother_state.total_length
              y1 = dy/4 + (1-control[control_keys[i]])*100-add_val
              x1 = x1.toString()
              y1 = y1.toString()
            }else{
              x1 = ((parseInt(control_keys[i])-1)*100/this.props.mother_state.total_length).toString()
              y1 = ((1-control[control_keys[i-1]])*100-add_val).toString()
            }

            var next_key = parseInt(control_keys[i])-2
            if(control_keys.indexOf(next_key)!=-1){
              var dx = 2*100/this.props.mother_state.total_length
              var dy = (1-control[control_keys[i]]*100) - (1-control[control_keys[i-2]]*100)
              x2 = dx/4+ parseInt(control_keys[i-1])*100/this.props.mother_state.total_length
              y2 = dy/4 + (1-control[control_keys[i-1]])*100-add_val

              x2 = x2.toString()
              y2 = y2.toString()
            }else{
              x2 = (parseInt(control_keys[i])*100/this.props.mother_state.total_length).toString()
              y2 = ((1-control[control_keys[i]])*100-add_val).toString()
              
            }
            
            path = path + 'C '+x1+' '+y1+' '+x2+' '+y2+' '
          }
        }
        if(control_keys.length>1){
          // path = path + x1+' '+y1
          path = path + ' C '+((parseInt(control_keys[0])-0.5)*100/this.props.mother_state.total_length).toString()+' '+((1-2*control[control_keys[0]]+control[control_keys[1]])*100-add_val).toString()+' '
          path = path + (control_keys[0]*100/this.props.mother_state.total_length).toString()+' '+((1-control[control_keys[0]])*100-add_val).toString()+' '
          path = path +((parseInt(control_keys[0])-0.5)*100/this.props.mother_state.total_length).toString()+' '+((1-2*control[control_keys[0]]+control[control_keys[1]])*100-add_val).toString()+' '

        }else{

        }
        // console.log(path)
        path = path+' z'
        // console.log('path', path, 'path')
        if(path.indexOf('undefined')==-1){
          
          var p_obj = generator.path(path, {fillStyle:'zigzag', fill:'red', strokeWidth:'0.6', roughness:'0.7'})
          var p = generator.toPaths(p_obj)
          // console.log(p)
          return (<g>
            <defs>
              <pattern id={'br_rough_'+idx.toString()} x={p[0]['pattern']['x']} y={p[0]['pattern']['y']} width={p[0]['pattern']['width']} height={p[0]['pattern']['height']} viewBox={p[0]['pattern']['viewBox']} patternUnits={p[0]['pattern']['objectBoundingBox']}>
                <path d={p[0]['pattern']['path']['d']} stroke={color} strokeWidth={p[0]['pattern']['path']['strokeWidth']}  fill={p[0]['pattern']['path']['fill']}></path>
              </pattern>
            </defs>
            <path d={p[0]['d']} stroke={'transparent'} opacity={opacity} fill={'url(#br_rough_'+idx.toString()+')'} strokeWidth={width} strokeLinecap="round"></path>
          </g>)
          // return (<path d={p[0]['pattern']['path']['d']} stroke={color} opacity='0.2' fill={color} strokeWidth={width} strokeLinecap="round"></path>)
        }
        
        
        // console.log('path', path, 'path')
        
      })

    }

    
  }



  renderControlsV2(){
    var controls = this.props.mother_state.controls[this.props.mother_state.cur_path_id][this.props.val._id]
    if(controls==undefined){
      return
    }
    return controls.map((control, idx)=>{
      return control.map((point, idx2)=>{
        if(idx2==0){
          return
        }
        var ppoint = control[idx2-1]

        var x1 = (ppoint[0]/this.props.mother_state.total_length*100)//+'%'
        var y1 = ((1-ppoint[1])*100)//+'%'
        var x2 = (point[0]/this.props.mother_state.total_length*100)//+'%'
        var y2 = ((1-point[1])*100)//+'%'
        var dist = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))
        x1=x1+'%'
        x2=x2+'%'
        y1=y1+'%'
        y2=y2+'%'
        
        var t = this.props.mother_state.control_times[this.props.val._id][idx][idx2]
        var vel = t/dist//+'%'
        if (vel>20){
          vel=20
        }
        vel = vel/20
        // console.log(vel)
        // console.log(t)
        // console.log(this.props.val._id+'_'+idx.toString()+'_'+idx2.toString())
        // return (<circle key={this.props.val._id+'_'+idx.toString()+'_'+idx2.toString()} cx={x2} cy={y2} fill="#888888" r={vel/2}></circle>)
        return (<line key={this.props.val._id+'_'+idx.toString()+'_'+idx2.toString()} x1={x1} x2={x2} y1={y1} y2={y2} stroke="#888888" strokeWidth={3} opacity={vel}></line>)
      })
    })

  }

  renderControls(path_id){
    var controls = this.props.mother_state.controls[path_id][this.props.val._id]
    if(document.getElementById('whole_canvas')===null){
      return
    }
    // var generator = rough.generator({},{width:document.getElementById('whole_canvas').getBoundingClientRect().width, height:document.getElementById('whole_canvas').getBoundingClientRect().height})
    var generator = this.state.generator
    // console.log('seeequence?', controls, this.props.val._id)
    if(controls!=undefined){
      var sequences =  [...Array(this.props.mother_state.total_length).keys()]
      // console.log('sequences!!!!')
      var valid_seq = 0
      for(var i in sequences){
        if(controls[sequences[i]]!=undefined){
          valid_seq=valid_seq+1
        }
      }
      if(valid_seq>1){
        return
      }
      return sequences.map((key, idx)=>{
        var not_in_prompt = !((key>=this.props.mother_state.text_front_prompt_start && key<=this.props.mother_state.text_front_prompt_end)||(key>=this.props.mother_state.text_back_prompt_start && key<=this.props.mother_state.text_back_prompt_end && this.props.mother_state.text_back_prompt_end!=-1))
        if(controls[key]!=undefined){
          if(true){
            var color = '#ff8888'
            if (!not_in_prompt){
              color='#aaaaaa'
            }
            
            
              var x = (key/this.props.mother_state.total_length*100-0.5)//+'%'//'calc('+key/this.props.mother_state.total_length*100+'% - 7px)'
              var y = ((1-controls[key])*100-0.5)//+'%' //'calc('+((1-controls[key])*100)+'% - 7px)'
              // var y = 'calc('+((1-controls[key])*100)+'% -5px)'
              // // console.log(y)
              // var opacity =this.props.mother_state.controls[path_id]['_regeneration'][key]/2
              var color = this.state.control_color
              if(path_id==this.props.mother_state.cur_path_id && this.props.val._id!='_surprise'){
                if(this.props.mother_state.original_controls!=undefined){
                  // console.log(Object.keys(this.props.mother_state.original_controls), key)
                  if(Object.keys(this.props.mother_state.original_controls).indexOf(key.toString())!=-1){
                    color=this.state.control_color_new
                  }
                }
              }
              var circle = generator.circle(x, y, 0.01, {roughness:0.4})
              var p = generator.toPaths(circle)
              return (<path d={p[0]['d']} stroke={color} strokeWidth={0.1} fill='transparent'></path>)
            
            
          }
        }else if(controls[key]==undefined && this.props.val._id=='_surprise'){
          // return
          if(not_in_prompt){
            // console.log('rendering?')
            var x = (key/this.props.mother_state.total_length*100-0.5)+'%'
            var y = ((1)*100-0.5)+'%' 
            return (<div className='sentence_dot' style={{border: 'solid 1px white', left: x, top: y, backgroundColor: this.state.control_color}}></div>)
          }
        }else{
          return
        }
      })
      return Object.keys(controls).map((key, idx)=>{
        if(key>this.props.mother_state.text_prompt_range){
          var x = 'calc('+key/this.props.mother_state.total_length*100+'% - 5px)'
          var y = (1-controls[key])*100+'%'
          return (<div className='sentence_dot' style={{border: 'solid 1px transparent', width: '10px', height:'10px', left: x, top: y, backgroundColor: '#ff8888'}}></div>)
        }
        
         
      })
    }else if(this.props.val._id=='_surprise'){
      var sequences =  [...Array(this.props.mother_state.total_length).keys()]
      // console.log(sequences)
      return sequences.map((key, idx)=>{
        var not_in_prompt = !((key>=this.props.mother_state.text_front_prompt_start && key<=this.props.mother_state.text_front_prompt_end)||(key>=this.props.mother_state.text_back_prompt_start && key<=this.props.mother_state.text_back_prompt_end && this.props.mother_state.text_back_prompt_end!=-1))
        if(not_in_prompt){
          console.log('rendering?')
          var x = (key/this.props.mother_state.total_length*100-0.5)+'%'
          var y = ((1)*100-0.5)+'%' 
          return (<div className='sentence_dot' style={{border: 'solid 1px white', left: x, top: y, backgroundColor: this.state.control_color}}></div>)
        }
      })

    }
    
  }

  


  

  renderArrows(cur_path_id){
    var text_parsed = this.props.mother_state.text_parsed[cur_path_id]
    return text_parsed.map((val, idx)=>{
      if(idx+1<text_parsed.length && idx+1<this.props.mother_state.total_length){
        var val = val[this.props.val._id]
        var val2 = text_parsed[idx+1][this.props.val._id]
        if(val==undefined || val2==undefined){
          return
        }
        var seq = idx
        var total_length = this.props.mother_state.total_length

        var x1 = seq/total_length*100+'%'
        var y1 = (1-val)*100+'%'

        var x2 = (seq+1)/total_length*100+'%'
        var y2 = (1-val2)*100+'%'

        return (<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#aaa" 
        strokeWidth="4" markerEnd="url(#arrowhead)"></line>)
      }
      
    })
  }

  renderSentenceBars(){
    var l = Array.from({length: this.props.mother_state.total_length+1}, (v, i) => i)
    return l.map((val, idx)=>{
      if(idx!=this.props.mother_state.total_length){
        var color = 'transparent'
        if(this.props.mother_state.generation_mode=='continuation'){
          if(idx>=this.props.mother_state.text_front_prompt_start && idx<=this.props.mother_state.text_front_prompt_end){
            color = '#cceeee'
          }else if(idx>this.props.mother_state.text_front_prompt_end && idx<=this.props.mother_state.text_generation_end){
            color = '#dddddd'
          }
        }else if(this.props.mother_state.generation_mode=='infilling'){
          if(idx>=this.props.mother_state.text_front_prompt_start && idx<=this.props.mother_state.text_front_prompt_end){
            color = '#cceeee'
          }else if(idx>this.props.mother_state.text_front_prompt_end && idx<this.props.mother_state.text_back_prompt_start){
            color = '#dddddd'
          }else if(idx>=this.props.mother_state.text_back_prompt_start && idx<=this.props.mother_state.text_back_prompt_end){
            color = '#cceeee'
          }
        }
        var color2 = 'transparent'
        if(this.props.mother_state.sent_highlighted_mouse!=-1 && idx==this.props.mother_state.sent_highlighted_mouse){
          color2 = '#DFEEFF'
        }else if(this.props.mother_state.sent_highlighted_mouse!=-1 && idx!=this.props.mother_state.sent_highlighted_mouse){
          color2 = 'transparent'
        }else if(this.props.mother_state.sent_highlighted_mouse==-1 && idx==this.props.mother_state.sent_highlighted){
          color2 = '#DFEEFF'
        }
        var color3 = 'transparent'
        if(this.props.mother_state.sent_highlighted_mouse!=-1 && idx+1==this.props.mother_state.sent_highlighted_mouse && idx+1!=this.props.mother_state.total_length){
          color3 = '#DFEEFF'
        }else if(this.props.mother_state.sent_highlighted_mouse!=-1 && idx+1!=this.props.mother_state.sent_highlighted_mouse){
          color3 = 'transparent'
        }else if(this.props.mother_state.sent_highlighted_mouse==-1 && idx+1==this.props.mother_state.sent_highlighted && idx+1!=this.props.mother_state.total_length){
          color3 = '#DFEEFF'
        }

        var x = 'calc('+(idx)/this.props.mother_state.total_length*100+'% )'
        var w = 'calc('+1/this.props.mother_state.total_length*100+'% )'
        var xprime = (idx-0.5)/this.props.mother_state.total_length*100+'%'//'calc('+(idx)/this.props.mother_state.total_length*100+'% - 20px)'
        return (<div>
          {/* <div className='sentence_bar' style={{width: 1/this.props.mother_state.total_length*100+'%', left: xprime, backgroundColor: color}}></div> */}
          <div className='sentence_bar' style={{left: x, borderRadius:'4px', width:w, backgroundColor: 'transparent'}}>
              
              <div className='sentence_bar' style={{left:0, borderRadius:'0px', width:'10px', backgroundColor:color2}}></div>
              <div className='sentence_bar' style={{right:1, borderRadius:'0px', width:'9px', backgroundColor:color3}}></div>
              
              {idx!=l.length-2 && <hr style={{
                float:'right', height:'calc( 100% - 20px)', width:'1px', border:'0px', 
                marginTop:'10px',
                backgroundColor:'#E2E0E0'}}></hr>}
          </div>
          
        </div>
        )
      }
      
    })
  }

  highlightSent(idx){
    // console.log('yeah')
    var _this = this
    this.props.mother_this.setState({sent_highlighted_mouse:idx}, function(){
      _this.props.mother_this.highlightSentence(_this.props.mother_state.text, _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id])
    })
  }

  dehighlightSent(){
    var _this = this
    this.props.mother_this.setState({sent_highlighted_mouse:-1}, function(){
      _this.props.mother_this.highlightSentence(_this.props.mother_state.text, _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id])
    })
  }

  renderSentences(cur_path_id){
    if(document.getElementById('whole_canvas')===null){
      return
    }
    // var generator = rough.generator({},{width:document.getElementById('whole_canvas').getBoundingClientRect().width, height:document.getElementById('whole_canvas').getBoundingClientRect().height})
    var generator = this.state.generator

    return this.props.mother_state.text_parsed[cur_path_id].map((val, idx)=>{
      if(val['sentence']!='' && idx<this.props.mother_state.total_length && val[this.props.val._id]!=undefined){
        var ratio = val[this.props.val._id]
        // var backgroundColor
        // if(ratio > 0.8) {
        //   backgroundColor = 'rgba(255, 221.39, 102.25, 0.5)'
        // }
        // else if(ratio > 0.6) {
        //   backgroundColor = 'rgba(218.11, 174.25, 18.39, 0.5)'
        // }
        // else if(ratio > 0.4) {
        //   backgroundColor = 'rgba(138.42, 117.83, 43.97, 0.5)'
        // }
        // else if(ratio > 0.2) {
        //   backgroundColor = 'rgba(61.92, 58.22, 44.95, 0.5)'
        // }
        // else {
        //   backgroundColor = 'rgba(0, 0, 0, 0.5)'
        // }

        // var r= parseInt((1-ratio)*255+ratio*182)
        // var g= parseInt((1-ratio)*182+ratio*255)
        // var b= 182
        // console.log(r,g,b)
        // var backgroundColor = 'rgb('+r.toString()+', '+g.toString()+', '+b.toString()+')'
        // console.log(backgroundColor)
        // var backgroundColor='#eeeeee'
        // var border = 'solid 1px rgb(255, 252, 249)'
        if(idx==this.props.mother_state.sent_highlighted_mouse && this.props.mother_state.sent_highlighted_mouse!=-1){
          color = '#ffff99'
        }else if(this.props.mother_state.sent_highlighted_mouse==-1 && idx==this.props.mother_state.sent_highlighted){
          color = '#ffff99'
        }
        var val = val[this.props.val._id]
        var seq = idx
        var total_length = this.props.mother_state.total_length

        var color = this.state.generated_color
        if(cur_path_id==this.props.mother_state.cur_path_id && this.props.val._id!='_surprise'){
          if(this.props.mother_state.original_controls!=undefined){
            // console.log(Object.keys(this.props.mother_state.original_controls), key)
            if(Object.keys(this.props.mother_state.original_controls).indexOf(idx.toString())!=-1){
              color=this.state.generated_color_new
            }
          }
        }
        var x = seq/total_length*100//'calc('+seq/total_length*100+'% - 10px)'
        var y = (1-val)*100//'calc('+(1-val)*100+'% - 10px)'

        var circle = generator.circle(x, y, 1, {roughness:0.4})
        var p = generator.toPaths(circle)
        return (<path d={p[0]['d']} stroke={color} strokeWidth={1} fill='transparent'></path>)

        
        return (<div onPointerEnter={this.highlightSent.bind(this, idx)} onPointerOut={this.dehighlightSent.bind(this)} className='sentence_dot' style={{width:'20px', height:'20px',left: x, top: y, border: border, backgroundColor: backgroundColor}}></div>)


      }
      
    })
  }

  renderAllArrows(){
    return Object.keys(this.props.mother_state.text_parsed).map((val, idx)=>{
      return this.renderGeneratedBezier(val)
    })
  }

  renderAllSentences(){
    return Object.keys(this.props.mother_state.text_parsed).map((val, idx)=>{
      return this.renderSentences(val)
    })
  }

  renderGradientColor(path_id,option){
    var control, color
    if(option=='control' || option=='control_area'){
      control = this.props.mother_state.controls[path_id]['protagonist']
      color = this.state.control_color
    }else{
      control = {}
      var messy_c= this.props.mother_state.text_parsed[path_id]
      // console.log('messy c ', messy_c)
      for(var i in messy_c){
        if(messy_c[i]['protagonist']!=undefined){
          control[i] = messy_c[i]
        }
      }
      color = this.state.generated_color
    }
    // console.log(control)
    if(control==undefined){
      return (<stop offset={'0%'} stop-color={color}></stop>)
    }
    // console.log('what is wrong with control?', control)
    var val_control = []
    for(var i in control){
      val_control.push(parseInt(i))
    }
    // console.log(val_control)
    // console.log('controls', this.props.mother_state.original_controls)
    var len = Math.max(...val_control)-Math.min(...val_control)
    var min = Math.min(...val_control)
    // console.log(min)
    var l = []
    for(var i=0; i<this.props.mother_state.total_length; i++){
      if(i-0.49>0){
        l.push(i-0.49)
      }
      l.push(i)
      if(i+0.49<this.props.mother_state.total_length){
        l.push(i+0.49)
      }
      
    }
    // var l = Array.apply(null, Array(this.props.mother_state.total_length)).map(function (x, i) { return i; })
    return l.map((val, idx)=>{
      // console.log((val-min)/len, val)
      if((val-min)/len*100>100 || (val-min)/len*100<0 ){
        return
      }
      // console.log(Object.keys(this.props.mother_state.original_controls), val)
      
      if(this.props.mother_state.cur_path_id==path_id && Object.keys(this.props.mother_state.original_controls).indexOf(Math.round(val).toString())!=-1){
        // console.log(option, 'on this!')
        var color
        if(option=='control'||option=='control_area'){
          color = this.state.control_color_new
        }else{
          color = this.state.generated_color_new
        }
        if(option!='control_area'){
          return (<stop offset={((val-min)/len*100)+'%'} stop-color={color}/>)
        }else{
          return (<stop offset={((val-min+0.5)/(len+1)*100)+'%'} stop-color={color}/>)
        }
        
      }
      var color
        if(option=='control'||option=='control_area'){
          color = this.state.control_color
        }else{
          color = this.state.generated_color
        }
        if(option!='control_area'){
          return (<stop offset={((val-min)/len*100)+'%'} stop-color={color}/>)
        }else{
          return (<stop offset={((val-min+0.5)/(len+1)*100)+'%'} stop-color={color}/>)
        }
    })
  }

  render() {
    return (
        <div id='whole_canvas' style={{backgroundColor: 'transparent', overflow:'hidden'}} className='canvas'>
          
          {this.renderSentenceBars()}
          <div style={{
            position:'absolute', left:'0px', right:'0', height: '3px', 
            backgroundColor: 'rgba(153, 153, 153, 0.7)', borderRadius:'2px',
            top: 'calc(50% - 1px)'}}>
          </div>
          <svg viewBox='0 0 100 100' preserveAspectRatio="none" id='control_svg' style={{position:'absolute', left:0, zIndex: 0, width: '100%', height: '100%'}}>
          {/* {this.renderControlsV2()} */}
          <defs>
            <linearGradient id="grad_control">
              {this.renderGradientColor(this.props.mother_state.cur_path_id, 'control')}
            </linearGradient>
            <linearGradient id="grad_control_area">
              {this.renderGradientColor(this.props.mother_state.cur_path_id, 'control_area')}
            </linearGradient>
            <linearGradient id="grad_control2">
              {this.renderGradientColor(this.props.mother_state.cur_path_id, 'generated')}
            </linearGradient>
          </defs>
          
          
          {this.props.mother_state.dropdown==false && this.renderControlsBezier(this.props.mother_state.cur_path_id)}
          {this.props.mother_state.dropdown && this.props.mother_state.hover_path_id!='' && this.renderControlsBezier(this.props.mother_state.hover_path_id)} 
          {this.props.mother_state.dropdown && this.props.mother_state.hover_path_id=='' && this.renderControlsBezier(this.props.mother_state.cur_path_id)} 

          </svg>
          <svg viewBox='0 0 100 100' preserveAspectRatio="none"  id='arrow_svg' style={{position:'relative', zIndex: 0, width: '100%', height: '100%'}}>
            <defs>
              <marker id="arrowhead" markerWidth="5" markerHeight="3.5" 
              refX="7" refY="1.75" orient="auto" fill='#aaa'>
                <polygon points="0 0, 5 1.75, 0 3.5" />
              </marker>
            </defs>
            {this.props.notrendersent!=true && this.props.mother_state.dropdown==false &&this.renderGeneratedBezier(this.props.mother_state.cur_path_id)}
            <g style={{opacity:'0.2'}}>
            {this.props.notrendersent!=true && this.props.mother_state.dropdown &&this.renderAllArrows(this.props.mother_state.cur_path_id)}
            </g>
            {this.props.notrendersent!=true && this.props.mother_state.dropdown && this.props.mother_state.hover_path_id!='' &&this.renderGeneratedBezier(this.props.mother_state.hover_path_id)}
            {this.props.notrendersent!=true && this.props.mother_state.dropdown && this.props.mother_state.hover_path_id=='' &&this.renderGeneratedBezier(this.props.mother_state.cur_path_id)}
            {this.props.mother_state.dropdown==false && this.renderControls(this.props.mother_state.cur_path_id)}
            {this.props.mother_state.dropdown && this.props.mother_state.hover_path_id!='' && this.renderControls(this.props.mother_state.hover_path_id)} 
            {this.props.mother_state.dropdown && this.props.mother_state.hover_path_id=='' && this.renderControls(this.props.mother_state.cur_path_id)}
            {this.props.notrendersent!=true && this.props.mother_state.dropdown==false && this.renderSentences(this.props.mother_state.cur_path_id)}  
            {this.props.notrendersent!=true && this.props.mother_state.dropdown && this.props.mother_state.hover_path_id!='' && this.renderSentences(this.props.mother_state.hover_path_id)} 
            {this.props.notrendersent!=true && this.props.mother_state.dropdown && this.props.mother_state.hover_path_id=='' && this.renderSentences(this.props.mother_state.cur_path_id)}  
            <g style={{opacity: '0.2'}}>
              {this.props.notrendersent!=true && this.props.mother_state.dropdown && this.renderAllSentences()}   
            </g>
          </svg>
           
          
          
          
          
               
        </div>
    )
  }
}