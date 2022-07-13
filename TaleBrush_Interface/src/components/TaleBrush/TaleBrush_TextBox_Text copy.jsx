// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import axios from 'axios';
import dl_server from './TaleBrush_var'
import M from 'materialize-css'

export default class TaleBrush_TextBox_Text extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: undefined,
      move_state: '',
      indicator_h: 71,
      dropdown: false,
    };
  }

  componentDidMount(){
    document.addEventListener('DOMContentLoaded', function() {
      var elems = document.querySelectorAll('.dropdown-trigger');
      var instances = M.Dropdown.init(elems);
    });
  }


  renderSentenceHighlights(){
    
    return this.props.mother_state.text

  }

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

  // storeAndParseSentences(e){
  //   var text = e.target.value
  //   var parsed = text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|")

  //   console.log(parsed, text)
    
  //   if(this.props.mother_state.text_parsed.length>0){
  //     var leng_to_prompt=this.props.mother_state.text.indexOf(this.props.mother_state.text_parsed[this.props.mother_state.text_prompt_range]['sentence'])
  //     // console.log(leng_to_prompt)
  //     if(this.props.mother_state.text_parsed[this.props.mother_state.text_prompt_range]!=undefined){
  //       leng_to_prompt = leng_to_prompt + this.props.mother_state.text_parsed[this.props.mother_state.text_prompt_range]['sentence'].length
  //     }
      
  //     // while(i<this.props.mother_state.text_prompt_range){
  //     //   leng_to_prompt = leng_to_prompt+this.props.mother_state.text_parsed[i].length
  //     //   i++
  //     // }
  //     console.log(leng_to_prompt, document.getElementById('textarea').selectionStart)
  //     if(document.getElementById('textarea').selectionStart<leng_to_prompt){
  //       this.props.mother_this.setState({text_prompt_range: 0})
  //     }
  //   }
    

  //   var origin_parsed = this.props.mother_state.text_parsed
  //   var parsed_tobe = []
  //   for(var i in parsed){
  //     var done_this_loop=false
  //     for(var j in origin_parsed){
  //       if(parsed[i]==origin_parsed[j]['sentence']){
  //         parsed_tobe.push(JSON.parse(JSON.stringify(origin_parsed[j])))
  //         done_this_loop = true
  //         break
  //       }
  //     }
  //     if(done_this_loop==false){
  //       // TODO compare with the previous and update the recognition result... sometime
  //       // TODO get recognition 
  //       var push_parse = {
  //         'sentence': parsed[i]
  //       }
  //       for(var i in this.props.mother_state.characters){
  //         var character = this.props.mother_state.characters[i]
  //         push_parse[character['_id']] = Math.random()
  //       }
  //       parsed_tobe.push(push_parse)
  //     }
      
  //   }

  //   console.log('parsed_tobe', parsed_tobe)
    

  //   this.props.mother_this.setState({text, text_parsed: parsed_tobe}, ()=>{
  //     this.highlightSentence(text, parsed_tobe)
  //   })
    
  //   // var innerHTML = text
  //   // for(var i in parsed){
      
  //   //   if(i<=this.props.mother_state.text_prompt_range){
  //   //     var single_parsed = parsed[i]
  //   //     // console.log(single_parsed, text)
  //   //     innerHTML = innerHTML.replace(single_parsed, '<span style="background-color: #ffff88">'+single_parsed+'</span>')
  //   //   }
      
      
  //   // }
  //   // innerHTML = innerHTML.replaceAll('\n', '<br/>')
  //   // document.getElementById('textarea_prompt').innerHTML = innerHTML

    
  // }

  textareaFocusOut(idx, e){
    // alert('what')
    // console.log()
    var squeezed = e.target.value.trim()//.replace(/\s/g, '')
    this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][idx] = {'sentence':squeezed}
    console.log(squeezed)
    var _this = this
    if(squeezed!=''){
      for(var i in this.props.mother_state.characters){
        var character = this.props.mother_state.characters[i]

        // // when machine is not connected
        _this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][idx][character['_id']] = Math.random()
        _this.props.mother_this.setState({})

        // recognition should go below
        // ////////////////////////////////////////////////////
        // var idx_min = parseInt(idx)-2
        // if (idx_min<0){
        //   idx_min = 0
        // }
        // // var idx_min = 0
        // var pre_context = ''
        // // console.log(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id])
        // // for(var j=idx_min; j<idx; j++){
        // //   console.log(j)
        // //   if(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][j]['sentence']=='' || this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][j]['sentence']==undefined){
        // //     pre_context = ''
        // //   }else{
        // //     pre_context = pre_context + this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][j]['sentence']
        // //   }
        // // }

        // axios(dl_server+'/labelSentence', {
        //   method: 'POST',
        //   data: {
        //     sentence: this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][idx]['sentence'],
        //     pre_context:pre_context,
        //     character: this.props.mother_state.characters[0]['name'],
        //   }
        // })
        // .then(function(response){
        //   console.log(response['data']['value'])
        //   _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][idx][character['_id']] = response['data']['value']/100
        //   _this.props.mother_this.setState({})
        // })
        // //////////////////////////////////////////
        
      }
    }else{
      for(var i in this.props.mother_state.characters){
        var character = this.props.mother_state.characters[i]
        console.log(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][idx])
        this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][idx][character['_id']] = undefined
      }
    }
    this.props.mother_this.storeState('text_update')
    this.props.mother_this.setState({})
  }

  storeSentence(){

  }

  // highlightSentence(text, parsed){
  //   var innerHTML = text
  //   for(var i in parsed){
      
  //     if(i<=this.props.mother_state.text_prompt_range){
  //       var single_parsed = parsed[i]['sentence']
  //       // console.log(single_parsed, text)
  //       innerHTML = innerHTML.replace(single_parsed, '<span style="background-color: #ffff88">'+single_parsed+'</span>')
  //     }
      
      
  //   }
  //   innerHTML = innerHTML.replaceAll('\n', '<br/>')
  //   document.getElementById('textarea_prompt').innerHTML = innerHTML
  // }

  adjustScrollHeight(e){
    console.log(e.target.scrollTop)
    document.getElementById('textarea_prompt').scrollTop = e.target.scrollTop
  }

  // setPromptPosition(){
  //   console.log(document.getElementById('textarea').selectionEnd)
  //   var text_pre = this.props.mother_state.text.substring(0,document.getElementById('textarea').selectionEnd)
  //   console.log(text_pre)
  //   for(var i in this.props.mother_state.text_parsed){
  //     var sentence = this.props.mother_state.text_parsed[i]['sentence']
  //     var after= text_pre.replace(sentence, '')
  //     // console.log(sentence)
  //     // console.log(after)
  //     // console.log(text_pre)
  //     if(after==text_pre){
  //       break
  //     }else{
  //       text_pre = after
  //     }
  //   }
  //   console.log(i)
  //   this.props.mother_this.setState({text_prompt_range: parseInt(i)}, ()=>{
  //     this.highlightSentence(this.props.mother_state.text, this.props.mother_state.text_parsed)
  //   })
  // }

  addNewSentence(idx){
    console.log(idx)
    console.log(this.props.mother_state)
    // text parsed --> move 1 behind from idx
    // controls --> move 1 behind from idx
    // if total_length is 30, alert the user that the last sentence would be removed. 
    var cfm=true
    if(this.props.mother_state.total_length==30){
      cfm = confirm('As the maximum allowed length of the story is 30 sentences, the last sentence will be deleted. Are you okay with it?')
    }
    if(cfm){
      for(var i=29; i>idx; i--){
        if(i!=0){
          this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i] = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i-1]
          for(var c in this.props.mother_state.controls){
            this.props.mother_state.controls[this.props.mother_state.cur_path_id][c][i] = this.props.mother_state.controls[c][i-1]
          }
        }
        
      }
      this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][idx] = {'sentence': ''}
      for(var c in this.props.mother_state.controls){
        this.props.mother_state.controls[this.props.mother_state.cur_path_id][c][idx] = undefined
      }
      if(this.props.mother_state.generation_mode=='continuation'){
        if(idx<=this.props.mother_state.text_front_prompt_start){
          var text_front_prompt_start = (this.props.mother_state.text_front_prompt_start+1<28)?this.props.mother_state.text_front_prompt_start+1:28
          var text_front_prompt_end = (this.props.mother_state.text_front_prompt_end+1<28)?this.props.mother_state.text_front_prompt_end+1:28
          var text_generation_end = (this.props.mother_state.text_generation_end+1<29)?this.props.mother_state.text_generation_end+1:29
          
          this.props.mother_this.setState({
            text_front_prompt_start:text_front_prompt_start,
            text_front_prompt_end:text_front_prompt_end,
            text_generation_end:text_generation_end,
          })
        }else if(idx<=this.props.mother_state.text_front_prompt_end){
          var text_front_prompt_end = (this.props.mother_state.text_front_prompt_end+1<28)?this.props.mother_state.text_front_prompt_end+1:28
          var text_generation_end = (this.props.mother_state.text_generation_end+1<29)?this.props.mother_state.text_generation_end+1:29
          
          this.props.mother_this.setState({
            text_front_prompt_end:text_front_prompt_end,
            text_generation_end:text_generation_end,
          })
        }else if(idx<=this.props.mother_state.text_generation_end){
          var text_generation_end = (this.props.mother_state.text_generation_end+1<29)?this.props.mother_state.text_generation_end+1:29
          
          this.props.mother_this.setState({
            text_generation_end:text_generation_end,
          })
        }
      }else if(this.props.mother_state.generation_mode=='infilling'){
        if(idx<=this.props.mother_state.text_front_prompt_start){
          var text_front_prompt_start = (this.props.mother_state.text_front_prompt_start+1<28)?this.props.mother_state.text_front_prompt_start+1:28
          var text_front_prompt_end = (this.props.mother_state.text_front_prompt_end+1<28)?this.props.mother_state.text_front_prompt_end+1:28
          var text_back_prompt_start = (this.props.mother_state.text_back_prompt_start+1<29)?this.props.mother_state.text_back_prompt_start+1:29
          var text_back_prompt_end = (this.props.mother_state.text_back_prompt_end+1<29)?this.props.mother_state.text_back_prompt_end+1:29
          
          this.props.mother_this.setState({
            text_front_prompt_start:text_front_prompt_start,
            text_front_prompt_end:text_front_prompt_end,
            text_back_prompt_start: text_back_prompt_start,
            text_back_prompt_end: text_back_prompt_end,
          })
        }else if(idx<=this.props.mother_state.text_front_prompt_end){
          var text_front_prompt_end = (this.props.mother_state.text_front_prompt_end+1<28)?this.props.mother_state.text_front_prompt_end+1:28
          var text_back_prompt_start = (this.props.mother_state.text_back_prompt_start+1<29)?this.props.mother_state.text_back_prompt_start+1:29
          var text_back_prompt_end = (this.props.mother_state.text_back_prompt_end+1<29)?this.props.mother_state.text_back_prompt_end+1:29
          
          this.props.mother_this.setState({
            text_front_prompt_end:text_front_prompt_end,
            text_back_prompt_start: text_back_prompt_start,
            text_back_prompt_end: text_back_prompt_end,
          })
        }else if(idx<=this.props.mother_state.text_back_prompt_start){
          console.log('here2?')
          var text_back_prompt_start = (this.props.mother_state.text_back_prompt_start+1<29)?this.props.mother_state.text_back_prompt_start+1:29
          var text_back_prompt_end = (this.props.mother_state.text_back_prompt_end+1<29)?this.props.mother_state.text_back_prompt_end+1:29
          
          this.props.mother_this.setState({
            text_back_prompt_start: text_back_prompt_start,
            text_back_prompt_end: text_back_prompt_end,
          })
        }else if(idx<=this.props.mother_state.text_back_prompt_end){
          console.log('here?')
          var text_back_prompt_end = (this.props.mother_state.text_back_prompt_end+1<29)?this.props.mother_state.text_back_prompt_end+1:29
          
          this.props.mother_this.setState({
            text_back_prompt_end: text_back_prompt_end,
          })
        }

      }
      var total_length = (this.props.mother_state.total_length+1>30)?30:this.props.mother_state.total_length+1
      var _this = this
      this.props.mother_this.setState({total_length: total_length}, function(){
        _this.props.mother_this.storeState('add_sentence')
      })
    }
    
  }

  deleteSentence(idx){
    console.log(idx)
    console.log(this.props.mother_state)
    // text parsed --> move 1 behind from idx
    // controls --> move 1 behind from idx
    // if total_length is 30, alert the user that the last sentence would be removed. 

    if(this.props.mother_state.generation_mode=='continuation'){
      if(idx==this.props.mother_state.text_front_prompt_start && idx==this.props.mother_state.text_front_prompt_end){
        alert('As deletion would remove context range, it will not be executed.')
        return
      }else if(idx==this.props.mother_state.text_generation_end && idx-1==this.props.mother_state.text_front_prompt_end){
        alert('As deletion would remove generation range, it will not be executed.')
        return
      }
    }else if(this.props.mother_state.generation_mode=='infilling'){
      if(idx==this.props.mother_state.text_front_prompt_start && idx==this.props.mother_state.text_front_prompt_end){
        alert('As deletion would remove context range, it will not be executed.')
        return
      }else if(idx==this.props.mother_state.text_front_prompt_end+1 && idx==this.props.mother_state.text_back_prompt_start-1){
        alert('As deletion would remove generation range, it will not be executed.')
        return
      }else if(idx==this.props.mother_state.text_back_prompt_end && idx==this.props.mother_state.text_back_prompt_start){
        alert('As deletion would remove context range, it will not be executed.')
        return
      }
    }

    for(var i=idx; i<30; i++){
      if(i!=29){
        this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i] = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i+1]
        for(var c in this.props.mother_state.controls){
          this.props.mother_state.controls[this.props.mother_state.cur_path_id][c][i] = this.props.mother_state.controls[c][i+1]
        }
      }else{
        this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i] = {'sentence':''}
        for(var c in this.props.mother_state.controls){
          this.props.mother_state.controls[this.props.mother_state.cur_path_id][c][i] = undefined
        }
      }
    }

    if(this.props.mother_state.generation_mode=='continuation'){
      if(idx<this.props.mother_state.text_front_prompt_start){
        var text_front_prompt_start = (this.props.mother_state.text_front_prompt_start-1>0)?this.props.mother_state.text_front_prompt_start-1:0
        var text_front_prompt_end = (this.props.mother_state.text_front_prompt_end-1>0)?this.props.mother_state.text_front_prompt_end-1:0
        var text_generation_end = (this.props.mother_state.text_generation_end-1>1)?this.props.mother_state.text_generation_end-1:1
        
        this.props.mother_this.setState({
          text_front_prompt_start:text_front_prompt_start,
          text_front_prompt_end:text_front_prompt_end,
          text_generation_end:text_generation_end,
        })
      }else if(idx<=this.props.mother_state.text_front_prompt_end){
        var text_front_prompt_end = (this.props.mother_state.text_front_prompt_end-1>0)?this.props.mother_state.text_front_prompt_end-1:0
        var text_generation_end = (this.props.mother_state.text_generation_end-1>1)?this.props.mother_state.text_generation_end-1:1
        
        this.props.mother_this.setState({
          text_front_prompt_end:text_front_prompt_end,
          text_generation_end:text_generation_end,
        })
      }else if(idx<=this.props.mother_state.text_generation_end){
        var text_generation_end = (this.props.mother_state.text_generation_end-1>1)?this.props.mother_state.text_generation_end-1:1
        
        this.props.mother_this.setState({
          text_generation_end:text_generation_end,
        })
      }
    }else if(this.props.mother_state.generation_mode=='infilling'){
      if(idx<=this.props.mother_state.text_front_prompt_start){
        var text_front_prompt_start = (this.props.mother_state.text_front_prompt_start-1>0)?this.props.mother_state.text_front_prompt_start-1:0
        var text_front_prompt_end = (this.props.mother_state.text_front_prompt_end-1>0)?this.props.mother_state.text_front_prompt_end-1:0
        var text_back_prompt_start = (this.props.mother_state.text_back_prompt_start-1>2)?this.props.mother_state.text_back_prompt_start-1:2
        var text_back_prompt_end = (this.props.mother_state.text_back_prompt_end-1>2)?this.props.mother_state.text_back_prompt_end-1:2
        
        this.props.mother_this.setState({
          text_front_prompt_start:text_front_prompt_start,
          text_front_prompt_end:text_front_prompt_end,
          text_back_prompt_start: text_back_prompt_start,
          text_back_prompt_end: text_back_prompt_end,
        })
      }else if(idx<=this.props.mother_state.text_front_prompt_end){
        var text_front_prompt_end = (this.props.mother_state.text_front_prompt_end-1>0)?this.props.mother_state.text_front_prompt_end-1:0
        var text_back_prompt_start = (this.props.mother_state.text_back_prompt_start-1>2)?this.props.mother_state.text_back_prompt_start-1:2
        var text_back_prompt_end = (this.props.mother_state.text_back_prompt_end-1>2)?this.props.mother_state.text_back_prompt_end-1:2
        
        this.props.mother_this.setState({
          text_front_prompt_end:text_front_prompt_end,
          text_back_prompt_start: text_back_prompt_start,
          text_back_prompt_end: text_back_prompt_end,
        })
      }else if(idx<=this.props.mother_state.text_back_prompt_start){
        var text_back_prompt_start = (this.props.mother_state.text_back_prompt_start-1>2)?this.props.mother_state.text_back_prompt_start-1:2
        var text_back_prompt_end = (this.props.mother_state.text_back_prompt_end-1>2)?this.props.mother_state.text_back_prompt_end-1:2
        
        this.props.mother_this.setState({
          text_back_prompt_start: text_back_prompt_start,
          text_back_prompt_end: text_back_prompt_end,
        })
      }else if(idx<=this.props.mother_state.text_back_prompt_end){
        var text_back_prompt_end = (this.props.mother_state.text_back_prompt_end-1>2)?this.props.mother_state.text_back_prompt_end-1:2
        
        this.props.mother_this.setState({
          text_back_prompt_end: text_back_prompt_end,
        })
      }
    }


    var total_length = (this.props.mother_state.total_length-1<0)?0:this.props.mother_state.total_length-1
    var _this = this
    this.props.mother_this.setState({total_length: total_length}, function(){
      _this.props.mother_this.storeState('delete_sentence')
    })
    
    



  }

  highlightSent(idx){
    this.props.mother_this.setState({sent_highlighted: idx})
  }

  dehighlightSent(idx){
    this.props.mother_this.setState({sent_highlighted: -1})
  }

  renderSentenceBoxes(){
    var l = [...Array(this.props.mother_state.total_length).keys()]
    var target_generation
    if(this.props.mother_state.dropdown && this.props.mother_state.hover_path_id!=''){
      target_generation = this.props.mother_state.hover_path_id
    }else{
      target_generation = this.props.mother_state.cur_path_id
    }
    return l.map((idx, val)=>{
      var color = '#eeeeee'
      var stat = 'empty'
      if(idx>=this.props.mother_state.text_front_prompt_start && idx<=this.props.mother_state.text_front_prompt_end){
        color = '#cceeee'
      }
      if(idx<=this.props.mother_state.text_back_prompt_end && idx>=this.props.mother_state.text_back_prompt_start && this.props.mother_state.text_back_prompt_start!=-1){
        color = '#cceeee'
      }
      if(this.props.mother_state.generation_mode=='continuation'){
        if(idx>this.props.mother_state.text_front_prompt_end && idx<=this.props.mother_state.text_generation_end){
          color = '#dddddd'
        }
      }else{
        if(idx<this.props.mother_state.text_back_prompt_start && idx>this.props.mother_state.text_front_prompt_end){
          color = '#dddddd'
        }
      }
      if(idx==this.props.mother_state.sent_highlighted){
        color = '#ffaaaa'
      }


       return (<div>
         <div style={{height:'21px'}} className='noselect'>
           <div>{idx+1}. <span className="btn red" style={{height:'22px', lineHeight:'22px', width: '22px', float:'right', padding: 0}} onPointerDown={this.deleteSentence.bind(this, idx)} disabled={this.props.mother_state.being_generated}>x</span></div>
         </div>
        <textarea onPointerEnter={this.highlightSent.bind(this, idx)} onPointerOut={this.dehighlightSent.bind(this, idx)} onChange={this.ontextChange.bind(this, idx)} value={this.props.mother_state.text_parsed[target_generation][idx]['sentence']} id={'sentence_box_'+idx} style={{height:'45px', resize: 'none', backgroundColor:color, border:'solid 1px transparent'}} onBlur={this.textareaFocusOut.bind(this, idx)}
        disabled={this.props.mother_state.being_generated}></textarea>
        <div onPointerDown={this.addNewSentence.bind(this, idx+1)} className='btn' style={{height: '10px', width: '100px', display: 'block', margin:'auto', lineHeight: '10px'}} disabled={this.props.mother_state.being_generated}>+</div>
        </div>)
    })
  }

  ontextChange(idx,e){
    console.log(idx, e)
    this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][idx]['sentence'] = e.target.value
    this.props.mother_this.setState({})
  }

  IndicatorMoveStart(state_name){
    if(this.props.mother_state.being_generated){
      return
    }
    this.setState({move_state:state_name})
  }

  IndicatorMove(e){
    if(this.state.move_state!=''){
      var t = document.getElementById('textslots_div').getBoundingClientRect().top
      var h = document.getElementById('textslots_div').scrollHeight
      var st = document.getElementById('textslots_div').scrollTop
      var ratio = (e.pageY+st-t-10)/h
      console.log(ratio)
      // console.log((e.pageY-t)/h)
      var idx = Math.floor(ratio*this.props.mother_state.total_length)
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
      
      
      console.log(idx)
    }
    
    
  }
  IndicatorMoveEnd(e){
    e.stopPropagation()
    console.log('stopu')
    if(this.state.move_state!=''){
      this.props.mother_this.storeState('context_adjust')
      this.setState({move_state:''})

    }
    
  }

  // closeDropdown(){
  //   console.log('close')
  //   this.setState({dropdown: false})
  // }

  renderContIndicators(){
    var front_start = this.props.mother_state.text_front_prompt_start
    var front_end = this.props.mother_state.text_front_prompt_end
    var gen_end = this.props.mother_state.text_generation_end

    return (<div>
      <div onPointerDown={this.IndicatorMoveStart.bind(this, 'front_start')} 
            onPointerMove={this.IndicatorMove.bind(this)} 
            onPointerUp={this.IndicatorMoveEnd.bind(this)} 
        style={{position:'absolute', width: '15px', height: '15px', backgroundColor:'#88dddd', top: (82*front_start)+'px'}}></div>
      <div style={{position:'absolute', backgroundColor:'#ccffff', width:'3px', left:'6px', top: (82*front_start+15)+'px', height: (82*(front_end-front_start+1)-20)}}></div>
      <div className='noselect' style={{position:'absolute', writingMode:'tb-rl', left:2, width: '16px', fontSize:'small', top: (82*(front_start+front_end+1)/2-53/2)}}>Context</div>
      <div onPointerDown={this.IndicatorMoveStart.bind(this, 'front_end')} 
            onPointerMove={this.IndicatorMove.bind(this)} 
            onPointerUp={this.IndicatorMoveEnd.bind(this)} 
        style={{position:'absolute', width: '15px', height: '15px', backgroundColor:'#88dddd', top: (82*(front_end+1)-20)+'px'}}></div>
      <div style={{position:'absolute', backgroundColor:'#eeeeee', width:'3px', left:'6px', top: (82*(front_end+1))+'px', height: (82*(gen_end-front_end)-20)}}></div>
      <div className='noselect' style={{position:'absolute', writingMode:'tb-rl', left:2, width: '16px', fontSize:'small', top: (82*(front_end+gen_end+2)/2-53/2), height: 'fit-content'}}>To gen</div>
      <div onPointerDown={this.IndicatorMoveStart.bind(this, 'gen_end')} 
            onPointerMove={this.IndicatorMove.bind(this)} 
            onPointerUp={this.IndicatorMoveEnd.bind(this)} 
        style={{position:'absolute', width: '15px', height: '15px', backgroundColor:'#333333', top: (82*(gen_end+1)-20)+'px'}}></div>
    </div>)
  }

  renderInfillIndicators(){
    var front_start = this.props.mother_state.text_front_prompt_start
    var front_end = this.props.mother_state.text_front_prompt_end
    var back_start = this.props.mother_state.text_back_prompt_start
    var back_end = this.props.mother_state.text_back_prompt_end

    return (<div>
      <div onPointerDown={this.IndicatorMoveStart.bind(this, 'front_start')} 
            onPointerMove={this.IndicatorMove.bind(this)} 
            onPointerUp={this.IndicatorMoveEnd.bind(this)} 
        style={{position:'absolute', width: '15px', height: '15px', backgroundColor:'#88dddd', top: (82*front_start)+'px'}}></div>
            <div style={{position:'absolute', backgroundColor:'#ccffff', width:'3px', left:'6px', top: (82*front_start+15)+'px', height: (82*(front_end-front_start+1)-20)}}></div>
      <div className='noselect' style={{position:'absolute', writingMode:'tb-rl', left:2, width: '15px', fontSize:'small', top: (82*(front_start+front_end+1)/2-53/2)}}>Context</div>
      <div onPointerDown={this.IndicatorMoveStart.bind(this, 'front_end')} 
            onPointerMove={this.IndicatorMove.bind(this)} 
            onPointerUp={this.IndicatorMoveEnd.bind(this)} 
        style={{position:'absolute', width: '15px', height: '15px', backgroundColor:'#88dddd', top: (82*(front_end+1)-20)+'px'}}></div>
      <div onPointerDown={this.IndicatorMoveStart.bind(this, 'back_start')} 
            onPointerMove={this.IndicatorMove.bind(this)} 
            onPointerUp={this.IndicatorMoveEnd.bind(this)} 
        style={{position:'absolute', width: '15px', height: '15px', backgroundColor:'#88dddd', top: (82*back_start)+'px'}}></div>
            <div style={{position:'absolute', backgroundColor:'#ccffff', width:'3px', left:'6px', top: (82*back_start+15)+'px', height: (82*(back_end-back_start+1)-20)}}></div>
      <div className='noselect' style={{position:'absolute', writingMode:'tb-rl', left:2, width: '15px', fontSize:'small', top: (82*(back_start+back_end+1)/2-53/2)}}>Context</div>
      <div onPointerDown={this.IndicatorMoveStart.bind(this, 'back_end')} 
            onPointerMove={this.IndicatorMove.bind(this)} 
            onPointerUp={this.IndicatorMoveEnd.bind(this)} 
        style={{position:'absolute', width: '15px', height: '15px', backgroundColor:'#88dddd', top: (82*(back_end+1)-20)+'px'}}></div>
        <div style={{position:'absolute', backgroundColor:'#eeeeee', width:'3px', left:'6px', top: (82*(front_end+1))+'px', height: (82*(back_start-front_end-1)-5)+'px'}}></div>
        <div className='noselect' style={{position:'absolute', writingMode:'tb-rl', left:2, width: '16px', fontSize:'small', top: (82*(front_end+back_start+1)/2-53/2), height: 'fit-content'}}>To gen</div>
    </div>)
  }

  changeGenMode(genmode){
    var _this = this
    if(genmode=='continuation'){
      this.props.mother_this.setState({generation_mode: genmode, text_back_prompt_end:-1, text_back_prompt_start:-1, text_generation_end: this.props.mother_state.total_length-1}, function(){
        _this.props.mother_this.storeState('change_generation_to_continuation')
      })
    }else if(genmode=='infilling'){
      this.props.mother_this.setState({generation_mode: genmode, text_back_prompt_end:this.props.mother_state.total_length-1, text_back_prompt_start:this.props.mother_state.total_length-1}, function(){
        _this.props.mother_this.storeState('change_generation_to_infilling')
      })
    }
    
  }

  deleteGenerated(val,e){
    e.stopPropagation()
    var _this = this
    this.props.mother_this.setState({hover_path_id:''}, function(){
      delete _this.props.mother_state.text_parsed[val]
      _this.props.mother_this.setState({}, function(){
        _this.props.mother_this.storeState('delete_generated')
      })
    })
    
    
    
  }
  
  changeCurPathId(val,e){
    e.stopPropagation()
    var _this = this
    this.props.mother_this.setState({cur_path_id: val, dropdown:false}, function(){
      _this.props.mother_this.storeState('change_current_path')
    })
  }

  setHoverPathId(_id){
    this.props.mother_this.setState({hover_path_id: _id})
  }
  addGeneratedName(val,e){
    e.stopPropagation()
    var name = prompt('Revise the name of the path.')
    this.props.mother_state.generated_names[val] = name
    this.props.mother_this.setState({})
  }

  renderGenerated(){
    return Object.keys(this.props.mother_state.text_parsed).map((val, idx)=>{
      var name = this.props.mother_state.generated_names[val]
      if(name==undefined){
        name =val
      }
      return (<li style={{margin:'2px', borderBottom:'solid 1px #eeeeee', color:(this.props.mother_state.cur_path_id==val)?'':'#888888'}} 
      onPointerEnter={this.setHoverPathId.bind(this, val)} onPointerLeave={this.setHoverPathId.bind(this, '')}
      onPointerDown={this.changeCurPathId.bind(this, val)}>
        {name}
       {Object.keys(this.props.mother_state.text_parsed).length>1 && this.props.mother_state.cur_path_id!=val && 
       <span onPointerDown={this.deleteGenerated.bind(this,val)} className='btn'
       style={{float:'right', backgroundColor:'red', color:'white', textAlign:'center', height: '16px', width:'16px', lineHeight:'14px', padding: 0}}
       disabled={this.props.mother_state.being_generated}>x</span>}
       <span onPointerDown={this.addGeneratedName.bind(this,val)}
       style={{marginRight:'4px', marginLeft:'4px',color:'black', float:'right', textAlign:'center', height: '16px', width:'16px', lineHeight:'14px'}}><i class="fas fa-pencil-alt"></i></span>
      </li>)
    })
  }

  toggleDropdown(e){
    e.stopPropagation()
    this.props.mother_this.setState({dropdown: !this.props.mother_state.dropdown})
  }

  


  render() {
    var cur_path_name = this.props.mother_state.generated_names[this.props.mother_state.cur_path_id]
    if(cur_path_name==undefined){
      cur_path_name = this.props.mother_state.cur_path_id
    }

    return (
        <div className='noselect' style={{position:'relative', height: '100%'}} onPointerMove={this.IndicatorMove.bind(this)} onPointerUp={this.IndicatorMoveEnd.bind(this)}>
            <div style={{position:'absolute', left:'-25px', top:'-50px', bottom: '-45px', width: 3}} onPointerEnter={this.IndicatorMoveEnd.bind(this)}></div>
            <div style={{margin:'auto', display:'block', width: 'fit-content', marginTop:'5px'}}>
              Generation Mode:
              <div style={{fontSize: '14px', lineHeight:'18px', height: '18px', verticalAlign:'baseline', backgroundColor: (this.props.mother_state.generation_mode=='continuation')?'':'#ccc'}} className='btn small' onPointerUp={this.changeGenMode.bind(this, 'continuation')}>Continue</div>
              <div style={{fontSize: '14px', lineHeight:'18px', height: '18px', verticalAlign:'baseline', backgroundColor: (this.props.mother_state.generation_mode=='infilling')?'':'#ccc'}} className='btn small' onPointerUp={this.changeGenMode.bind(this, 'infilling')}>Infill</div>
            </div>
            
            <div style={{position:'relative'}}>
              <a class='btn' style={{height: '18px', lineHeight:'18px', fontSize:'14px', margin: 'auto', display: 'block'}} href='/talebrush/#' onPointerDown={this.toggleDropdown.bind(this)}>Generated: {cur_path_name}</a>
              <ul id='dropdown1' style={{display: (this.props.mother_state.dropdown)?'':'none', position:'absolute', backgroundColor:'white', width:'100%', zIndex: '10', border:'solid 1px #888'}}>
                {this.renderGenerated()}
              </ul>
            </div>
            
            
            {/* <div id='textarea_prompt' className='commonText' style={{border: '1px solid transparent', color:'transparent', overflowY:'auto'}}></div> */}
            <div  style={{border: '1px solid transparent', overflowY:'auto', height: '100%', position:'relative', display: 'flex', marginTop:'10px'}}>

              {this.props.mother_state.generation_mode=='continuation' && this.renderContIndicators()}
              {this.props.mother_state.generation_mode=='infilling' && this.renderInfillIndicators()}
              {/* <Nouislider style={{height:'100%'}} range={{ min: 0, max: this.props.mother_state.total_length-1 }} start={[this.props.mother_state.text_front_prompt_start, this.props.mother_state.text_front_prompt_end]} step={1} orientation='vertical'></Nouislider> */}
              <div id='textslots_div' style={{marginLeft:'20px', width:'100%', height:'fit-content'}}>
              <div onPointerDown={this.addNewSentence.bind(this, 0)} className='btn' style={{height: '10px', width: '100px', display: 'block', margin:'auto', lineHeight: '10px'}} disabled={this.props.mother_state.being_generated}>+</div>
                {this.renderSentenceBoxes()}
              </div>
              
            </div>
            {/* <textarea id='textarea' className='commonText' value={this.props.mother_state.text} 
            style={{resize: 'none'}}
            onChange={this.storeAndParseSentences.bind(this)} onScroll={this.adjustScrollHeight.bind(this)}></textarea>
            <div type='btn' style={{position: 'absolute', height: '40px', bottom:'0px', textAlign: 'center', borderRadius:'5px', backgroundColor:'#008800', color: 'white', padding:'8px'}}
              onPointerDown={this.setPromptPosition.bind(this)}
            >Set before the cursor as prompt.</div> */}

        </div>
    )
  }
}