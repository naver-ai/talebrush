// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import axios from 'axios';
import dl_server from './TaleBrush_var'
import M from 'materialize-css'
import { parse } from '@babel/core';
import {fortuneRecognition} from './TaleBrush_Generate'
import icon_history from '../../img/icon_history.png';
import TextareaAutosize from 'react-textarea-autosize';
import edit from '../../img/edit.png'
import history_default from '../../img/history_default.png'
import history_hover from '../../img/history_hover.png'
import history_less from '../../img/history_less.png'
import { head } from 'lodash';


export default class TaleBrush_TextBox_Text extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: undefined,
      move_state: '',
      indicator_h: 71,
      dropdown: false,
      selectionStart: -1,
      selectionEnd: -1,
      ori_text: '',
    };
  }

  componentDidMount(){
    document.addEventListener('DOMContentLoaded', function() {
      var elems = document.querySelectorAll('.dropdown-trigger');
      var instances = M.Dropdown.init(elems);
    });
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
        // console.log(idx, x_axis, y_axis)
        
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
        Protagonist:
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



  renderSentenceHighlights(){
    
    return this.props.mother_state.text

  }
  
  decideHighlightedSentence(text){
    // console.log('highlighted?', text)
    var sel_start = document.getElementById('textarea').selectionStart-1
    var leng_start = 0
    var leng_end = 0
    var sent_highlighted = -1
    for(var i=0; i<this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id].length; i++){
      // console.log(i,'leng start first', leng_start)
      var add_a, add_b
      if(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence']!=''){
        add_a = text.indexOf(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence'])
        add_b = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence'].length
        
      }else{
        if(i==0){
          add_a = 1
        }else{
          add_a = 0
        }
        if(i==0){
          add_b = 0
        }else{
          add_b = 2
        }
      }
      leng_start = leng_start + add_a
      leng_end = leng_start+add_b
      // leng_start=leng_start + text.indexOf(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence'])
      // // console.log(i,'leng start 2nd', leng_start)
      // leng_end=leng_start + this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence'].length

      text = text.substring(add_a+add_b)
      // text = text.substring(text.indexOf(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence'])+this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i]['sentence'].length)
      // console.log(text, leng_start, leng_end, sel_start)
      if(sel_start>=leng_start && sel_start<=leng_end){
        // console.log(i, 'is this!')
        sent_highlighted = i
        break
      }
      leng_start = leng_end
    }
    var sent_changed = 'false'
    // console.log('high lighted', sent_highlighted, this.props.mother_state.sent_highlighted)
    if(sent_highlighted!=this.props.mother_state.sent_highlighted){
      sent_changed = this.props.mother_state.sent_highlighted
    }
    this.props.mother_this.setState({sent_highlighted})
    
    return sent_changed
    
    
  }

  processDecideHighlightedSentence(changed_sentences=undefined, pointerup=false, prev_total_length=-1, e){
    if(e!=undefined){
      e.stopPropagation()
    }
    if(pointerup){
      this.setState({selectionStart:document.getElementById('textarea').selectionStart, selectionEnd:document.getElementById('textarea').selectionEnd, ori_text:this.props.mother_state.text})
    }
    
    var sent_changed = this.decideHighlightedSentence(this.props.mother_state.text)
    if(changed_sentences == undefined){
      changed_sentences = [sent_changed]
    }
    if(prev_total_length>0 && prev_total_length!=this.props.mother_state.total_length){
      if(sent_changed=='false'){
        sent_changed = 'true'
      }
    }
    // console.log('senteces to be changed are...', changed_sentences)
    var parsed = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id]
    var _this = this
    // console.log('sent chagned', sent_changed, changed_sentences)
    if(sent_changed!='false'){
      for(var id=0; id<changed_sentences.length; id++){
        var sc = changed_sentences[id]
        // console.log(sc, parsed[sc])
        if(parsed.length>0 && parsed[sc]!=undefined){
          // console.log('sent added?', sc, parsed[sc])
          for(var i in this.props.mother_state.characters){
            var character = this.props.mother_state.characters[i]
            if(parsed[sc]['sentence'].length>1 && parsed[sc][character['_id']]==undefined){
              fortuneRecognition(this, sc, character)
              // parsed[sc][character['_id']] = Math.random()
            }
            
          }
        }
      }
      
      
    }
    // console.log('parsed', parsed)
    this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id] = parsed
    this.props.mother_this.setState({}, function(){
      _this.props.mother_this.highlightSentence(_this.props.mother_state.text, parsed)
    })

    
  }

  keydownprocessDecideHighlightedSentence(e){
    if(e.key=='ArrowRight'||e.key=='ArrowLeft'||e.key=='ArrowDown'||e.key=='ArrowUp'){
      // console.log('key?')
      this.processDecideHighlightedSentence(undefined, true)
    }
  }

  onBlurProcess(){
    
    var parsed = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id]
    for(var i in parsed){
      for(var j in this.props.mother_state.characters){
        var character = this.props.mother_state.characters[j]
        if(parsed[i]['sentence'].length>1 && parsed[i][character['_id']]==undefined){
          // parsed[i][character['_id']] = Math.random()
          fortuneRecognition(this, i, character)
        }
        
      }
    }
    var _this = this
    this.props.mother_this.setState({sent_highlighted: -1}, function(){
      _this.props.mother_this.highlightSentence(_this.props.mother_state.text, _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id])
    })
  }

  storeAndParseSentences(e){
    var text = e.target.value
    // console.log('selections', this.state.selectionStart, this.state.selectionEnd)
    // console.log(this.state.ori_text==e.target.value)
    var cur_front_text = e.target.value.slice(0, document.getElementById('textarea').selectionStart)
    var cur_back_text = e.target.value.slice(0, document.getElementById('textarea').selectionStart)
    var front_text = this.state.ori_text.slice(0, this.state.selectionStart)
    var back_text = this.state.ori_text.slice(0, this.state.selectionEnd)
    
    var text2 = text.replace(/\n^(?!>)/mg, "\n>").replace(/(>)(.*?)(>)/mg, "$1$2").replace(/(>)([\r\t\f\v ]*)/mg, '$1')
    cur_front_text = cur_front_text.replace(/\n^(?!>)/mg, "\n>").replace(/(>)(.*?)(>)/mg, "$1$2").replace(/(>)([\r\t\f\v ]*)/mg, '$1')
    cur_back_text = cur_back_text.replace(/\n^(?!>)/mg, "\n>").replace(/(>)(.*?)(>)/mg, "$1$2").replace(/(>)([\r\t\f\v ]*)/mg, '$1')
    front_text = front_text.replace(/\n^(?!>)/mg, "\n>").replace(/(>)(.*?)(>)/mg, "$1$2").replace(/(>)([\r\t\f\v ]*)/mg, '$1')
    back_text = back_text.replace(/\n^(?!>)/mg, "\n>").replace(/(>)(.*?)(>)/mg, "$1$2").replace(/(>)([\r\t\f\v ]*)/mg, '$1')
    if(text2[0]!='>'){
      text2='>'+text2
      cur_front_text = '>'+cur_front_text
      cur_back_text = '>'+cur_back_text
      front_text = '>'+front_text
      back_text = '>'+back_text
    }
    var cursor_pos = -1
    if(text!=text2){
      cursor_pos = document.getElementById('textarea').selectionStart
    }
    // console.log('text2', text2)
    var parsed = text2.replace(/\n>/mg, "|").replace(/>/mg, "").split('|')
    var cur_front_parsed = cur_front_text.replace(/\n>/mg, "|").replace(/>/mg, "").split('|').length-1
    var cur_back_parsed = cur_back_text.replace(/\n>/mg, "|").replace(/>/mg, "").split('|').length-1
    var front_parsed = front_text.replace(/\n>/mg, "|").replace(/>/mg, "").split('|').length-1
    var back_parsed = back_text.replace(/\n>/mg, "|").replace(/>/mg, "").split('|').length-1
    // console.log('front and back', front_parsed, back_parsed, cur_front_parsed, cur_back_parsed)
    // console.log(parsed)
    

    var origin_parsed = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id]
    var parsed_tobe = []
    var changed_sentences = []
    var origin_parsed_counter = 0


    for (var i=0; i<front_parsed; i++){
      parsed_tobe.push(JSON.parse(JSON.stringify(origin_parsed[i])))
      
    }
    
    for(var i=front_parsed; i<cur_back_parsed+1; i++){
      // console.log('changed texts are', parsed[i])
      var push_parse = {
        'sentence': parsed[i].replace( /^\s+|\s+$/g, ''), 

      }
      if(push_parse['sentence']!=''){
        changed_sentences.push(i)
      }
      
      parsed_tobe.push(push_parse)
      // changed_sentences.push(i)
    }

    // console.log('parsed to be', parsed_tobe, parsed.length, origin_parsed.length, front_parsed, cur_back_parsed)
    if(parsed.length>origin_parsed.length){
      if(parsed_tobe[front_parsed]!=undefined && parsed_tobe[front_parsed+1]!=undefined){
        if(parsed_tobe[front_parsed]['sentence']=='' && parsed_tobe[front_parsed+1]['sentence']==''){
          changed_sentences.push(front_parsed)
        }
      }
    }

    var n_start = cur_back_parsed+1

    

    for(var i=n_start; i<parsed.length; i++){
      if(parsed.length>=origin_parsed.length){
        // console.log('here?')
        if(i-(cur_back_parsed-back_parsed)<origin_parsed.length){
          parsed_tobe.push(JSON.parse(JSON.stringify(origin_parsed[i - (cur_back_parsed-back_parsed)])))
        }else{
          var push_parse={
            'sentence':''
          }
          parsed_tobe.push(push_parse)
        }
      }else{
        if(i+ (back_parsed-front_parsed)-(cur_back_parsed-cur_front_parsed)<=origin_parsed.length){
          parsed_tobe.push(JSON.parse(JSON.stringify(origin_parsed[i + (back_parsed-front_parsed)-(cur_back_parsed-cur_front_parsed)])))
        }else{
          var push_parse={
            'sentence':''
          }
          // parsed_tobe.push(push_parse)
        }
      }
      
      
    }

    


    var _this = this

    var prev_total_length = this.props.mother_state.total_length
    if(prev_total_length>parsed_tobe.length){
      // deleted
      for(var i=back_parsed+1; i<this.props.mother_state.total_length; i++){
        var idx = (i-(back_parsed-front_parsed)).toString()
        for(var j in this.props.mother_state.controls[this.props.mother_state.cur_path_id]){
          this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][idx] = this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][i.toString()]
        }
      }
      for(var i=this.props.mother_state.total_length - (back_parsed-front_parsed); i<this.props.mother_state.total_length; i++){
        for(var j in this.props.mother_state.controls[this.props.mother_state.cur_path_id]){
          if(this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][i.toString()]!=undefined){
            delete this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][i.toString()]
          }
        }
      } 
      for(var i=0; i<this.props.mother_state.total_length; i++){
        for(var j in this.props.mother_state.controls[this.props.mother_state.cur_path_id]){
          if(this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][i.toString()]==undefined){
            delete this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][i.toString()]
          }
        }
      } 

    }else if(prev_total_length<parsed_tobe.length){
      // add
      var fp = front_parsed
      if(parsed_tobe[front_parsed]!=undefined && parsed_tobe[front_parsed+1]!=undefined){
        if(parsed_tobe[front_parsed]['sentence']==""&&parsed_tobe[front_parsed+1]['sentence']!=""){
          fp = fp-1  
        }
      }
      console.log('added?', changed_sentences, cur_front_parsed, front_parsed)
      for(var i=this.props.mother_state.total_length-1; i>fp; i--){
        var idx = back_parsed-front_parsed+1 +i
        console.log(idx, i)
        for(var j in this.props.mother_state.controls[this.props.mother_state.cur_path_id]){
          if(this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][i.toString()]!=undefined){
            this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][idx] = this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][i.toString()]
          }else{
            delete this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][idx]
          }
          
        }
      }
      
      

      // remove
      if(changed_sentences.indexOf(cur_front_parsed)!=-1){
        
        for(var j in this.props.mother_state.controls[this.props.mother_state.cur_path_id]){
            delete this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][cur_front_parsed-1]
        }
      }
      
      
      if(changed_sentences.indexOf(front_parsed)!=-1){
        
        for(var j in this.props.mother_state.controls[this.props.mother_state.cur_path_id]){
            delete this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][front_parsed+1]
        }
      }
      for(var i=0; i<this.props.mother_state.total_length; i++){
        for(var j in this.props.mother_state.controls[this.props.mother_state.cur_path_id]){
          if(this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][i.toString()]==undefined){
            delete this.props.mother_state.controls[this.props.mother_state.cur_path_id][j][i.toString()]
          }
        }
      } 
    }

    this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id] = parsed_tobe
    this.props.mother_this.setState({text:text2, total_length: parsed_tobe.length, original_controls:{}}, ()=>{
      if(text!=text2){
        // console.log('cursor_pos', cursor_pos)
        document.getElementById('textarea').focus()
        document.getElementById('textarea').setSelectionRange(cursor_pos-1, cursor_pos-1)
      }
      // _this.processDecideHighlightedSentence()
      _this.processDecideHighlightedSentence(changed_sentences, false, prev_total_length)
      // this.highlightSentence(text, parsed_tobe)
      
    })
    
    // var innerHTML = text
    // for(var i in parsed){
      
    //   if(i<=this.props.mother_state.text_prompt_range){
    //     var single_parsed = parsed[i]
    //     // console.log(single_parsed, text)
    //     innerHTML = innerHTML.replace(single_parsed, '<span style="background-color: #ffff88">'+single_parsed+'</span>')
    //   }
      
      
    // }
    // innerHTML = innerHTML.replaceAll('\n', '<br/>')
    // document.getElementById('textarea_prompt').innerHTML = innerHTML

    
  }

  textareaFocusOut(idx, e){
    // alert('what')
    // console.log()
    var squeezed = e.target.value.trim()//.replace(/\s/g, '')
    this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][idx] = {'sentence':squeezed}
    // console.log(squeezed)
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
        // console.log(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][idx])
        this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][idx][character['_id']] = undefined
      }
    }
    this.props.mother_this.storeState('text_update')
    this.props.mother_this.setState({})
  }

  storeSentence(){

  }

  // highlightSentence(text, parsed){
  //   console.log(text)
  //   var innerHTML = text
    
  //   for(var i in parsed){
  //     // console.log(i)
  //     if(this.props.mother_state.generation_mode=='continuation'){
  //       if(i<=this.props.mother_state.text_front_prompt_end && i>=this.props.mother_state.text_front_prompt_start){
  //         var single_parsed = parsed[i]['sentence']
  //         // console.log(single_parsed)
  //         // single_parsed = single_parsed.replaceAll(' ', '&nbsp;')
  //         // console.log(single_parsed, text)
  //         innerHTML = innerHTML.replace(single_parsed, '<span style="background-color: #ffff88">'+single_parsed+'</span>')
  //       }
  //     }
  //   }
    
  //   innerHTML = innerHTML.replaceAll('\n', '<br/>')
  //   var regex = /(\<\/span[\w\s]+\>)(\s+)(\<span[\w\s])/ig; 
  //   innerHTML = innerHTML.replace(regex, "&nbsp;");
    
  //   // console.log(innerHTML)
  //   document.getElementById('textarea_prompt').innerHTML = innerHTML
  // }

  adjustScrollHeight(e){
    // console.log(e.target.scrollTop)
    document.getElementById('textarea_prompt').scrollTop = e.target.scrollTop
  }

  setPromptPosition(){
    // console.log(document.getElementById('textarea').selectionEnd)
    var text_pre = this.props.mother_state.text.substring(0,document.getElementById('textarea').selectionEnd)
    // console.log(text_pre)
    for(var i in this.props.mother_state.text_parsed){
      var sentence = this.props.mother_state.text_parsed[i]['sentence']
      var after= text_pre.replace(sentence, '')
      // console.log(sentence)
      // console.log(after)
      // console.log(text_pre)
      if(after==text_pre){
        break
      }else{
        text_pre = after
      }
    }
    // console.log(i)
    this.props.mother_this.setState({text_prompt_range: parseInt(i)}, ()=>{
      this.props.mother_this.highlightSentence(this.props.mother_state.text, this.props.mother_state.text_parsed)
    })
  }

  addNewSentence(idx){
    // console.log(idx)
    // console.log(this.props.mother_state)
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
          for(var c in this.props.mother_state.controls[this.props.mother_state.cur_path_id]){
            this.props.mother_state.controls[this.props.mother_state.cur_path_id][c][i] = this.props.mother_state.controls[this.props.mother_state.cur_path_id][c][i-1]
          }
        }
        
      }
      this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][idx] = {'sentence': ''}
      for(var c in this.props.mother_state.controls[this.props.mother_state.cur_path_id]){
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
          // console.log('here2?')
          var text_back_prompt_start = (this.props.mother_state.text_back_prompt_start+1<29)?this.props.mother_state.text_back_prompt_start+1:29
          var text_back_prompt_end = (this.props.mother_state.text_back_prompt_end+1<29)?this.props.mother_state.text_back_prompt_end+1:29
          
          this.props.mother_this.setState({
            text_back_prompt_start: text_back_prompt_start,
            text_back_prompt_end: text_back_prompt_end,
          })
        }else if(idx<=this.props.mother_state.text_back_prompt_end){
          // console.log('here?')
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
    // console.log(idx)
    // console.log(this.props.mother_state)
    // text parsed --> move 1 behind from idx
    // controls --> move 1 behind from idx
    // if total_length is 30, alert the user that the last sentence would be removed. 

    if(this.props.mother_state.generation_mode=='continuation'){
      if(idx==this.props.mother_state.text_front_prompt_start && idx==this.props.mother_state.text_front_prompt_end){
        alert('As deletion would remove context range, it will not be executed.')
        return false
      }else if(idx==this.props.mother_state.text_generation_end && idx-1==this.props.mother_state.text_front_prompt_end){
        alert('As deletion would remove generation range, it will not be executed.')
        return false
      }
    }else if(this.props.mother_state.generation_mode=='infilling'){
      if(idx==this.props.mother_state.text_front_prompt_start && idx==this.props.mother_state.text_front_prompt_end){
        alert('As deletion would remove context range, it will not be executed.')
        return false
      }else if(idx==this.props.mother_state.text_front_prompt_end+1 && idx==this.props.mother_state.text_back_prompt_start-1){
        alert('As deletion would remove generation range, it will not be executed.')
        return false
      }else if(idx==this.props.mother_state.text_back_prompt_end && idx==this.props.mother_state.text_back_prompt_start){
        alert('As deletion would remove context range, it will not be executed.')
        return false
      }
    }

    for(var i=idx; i<30; i++){
      if(i!=29){
        this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i] = this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i+1]
        for(var c in this.props.mother_state.controls[this.props.mother_state.cur_path_id]){
          this.props.mother_state.controls[this.props.mother_state.cur_path_id][c][i] = this.props.mother_state.controls[this.props.mother_state.cur_path_id][c][i+1]
        }
      }else{
        this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id][i] = {'sentence':''}
        for(var c in this.props.mother_state.controls[this.props.mother_state.cur_path_id]){
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
    return true

    // var total_length = (this.props.mother_state.total_length-1<0)?0:this.props.mother_state.total_length-1
    // var _this = this
    // this.props.mother_this.setState({total_length: total_length}, function(){
    //   _this.props.mother_this.storeState('delete_sentence')
    // })
    
    



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
    // console.log('stopu')
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
    this.props.mother_this.setState({cur_path_id: val, dropdown:false, total_length: this.props.mother_state.text_parsed[val].length, original_controls: {}}, function(){
      _this.props.mother_this.storeState('change_current_path')
    })
  }

  setHoverPathId(_id){
    var _this = this
    var to_id = _id
    if(_id==''){
      to_id = this.props.mother_state.cur_path_id
    }
    this.props.mother_this.setState({hover_path_id: _id}, function(){
      var text = ''
      var text_parsed = _this.props.mother_state.text_parsed[to_id]
      for(var i in text_parsed){
        if(i==0){
          text = text+'>'
        }else{
          text = text+'\n>'
        }
        text = text+ text_parsed[i]['sentence']
      }
      _this.props.mother_this.setState({text}, function(){
        _this.props.mother_this.highlightSentence(text, text_parsed)
      })
    })
  }
  addGeneratedName(val,e){
    e.stopPropagation()
    var _this =this
    var name = prompt('Revise the name of the path.')
    this.props.mother_state.generated_names[val] = name
    this.props.mother_this.setState({}, function(){
      _this.props.mother_this.storeState('change_generated_name')
    })
  }

  renderGenerated(){
    return Object.keys(this.props.mother_state.text_parsed).map((val, idx)=>{
      var name = this.props.mother_state.generated_names[val]
      if(name==undefined){
        name =val
      }
      return (<li style={{margin:'2px', borderBottom:'solid 1px #eeeeee', color:(this.props.mother_state.cur_path_id==val)?'':'#888888'}} 
      onPointerEnter={this.setHoverPathId.bind(this, val)} onPointerLeave={this.setHoverPathId.bind(this, '')}
      onPointerUp={this.changeCurPathId.bind(this, val)}>
        {name}
       {Object.keys(this.props.mother_state.text_parsed).length>1 && this.props.mother_state.cur_path_id!=val && 
       <span onPointerUp={this.deleteGenerated.bind(this,val)}
       style={{float:'right', backgroundColor:'#ff4444', color:'white', borderRadius: '5px', textAlign:'center', height: '20px', width:'20px', lineHeight:'18px', padding: 0}}
       disabled={this.props.mother_state.being_generated}>x</span>}
       <span onPointerUp={this.addGeneratedName.bind(this,val)}
       style={{marginRight:'4px', marginLeft:'4px',color:'black', float:'right', textAlign:'center', height: '16px', width:'16px', lineHeight:'14px'}}>
         <img src={edit} style={{width:'20px'}}/>
      </span>
      </li>)
    })
  }

  toggleDropdown(e){
    e.stopPropagation()
    if(this.props.mother_state.being_generated==false){
      this.props.mother_this.setState({dropdown: !this.props.mother_state.dropdown})
      // var deg = document.getElementById("arrow").style.transform.value;
    }
    
  }
  test(){
    console.log('test')
  }
  checkCharacterName(){
    if(this.props.mother_state.characters[0]['name']==''){
      alert('Please first set the name of protagonist.')
      document.getElementById('textarea').blur()
    }
  }

  renderSentenceIndicator() {
    var control_keys = []
    var original_controls = this.props.mother_state.original_controls
    if(original_controls!=undefined){
      for(var i in original_controls){
        control_keys.push(parseInt(i))
      }
    }
    
    var headBarH, generatedBarH, tailBarH

    if(control_keys.length ==0 || (this.props.mother_state.hover_path_id!='' && this.props.mother_state.cur_path_id!=this.props.mother_state.hover_path_id)){
      generatedBarH=0
      tailBarH=0
      var total_length
      if((this.props.mother_state.hover_path_id!='' && this.props.mother_state.cur_path_id!=this.props.mother_state.hover_path_id)){
        total_length = Object.keys(this.props.mother_state.text_parsed[this.props.mother_state.hover_path_id]).length
      }else{
        total_length = this.props.mother_state.total_length
      }
      // console.log('span_fill_'+(this.props.mother_state.total_length-1).toString())

      var en_ob = document.getElementById('span_fill_'+(this.props.mother_state.total_length-1).toString())
      var st_ob = document.getElementById('span_fill_0')
      // console.log('obs', en_ob!==null, st_ob!==null)
      if(en_ob===null || st_ob===null){
        headBarH = 0
      }else{
        headBarH = en_ob.getBoundingClientRect().bottom - st_ob.getBoundingClientRect().top  
      }
      
    }else{
      var c_min = Math.min(...control_keys)
      var c_max = Math.max(...control_keys)
      var st_ob = document.getElementById('span_fill_0')
      var gen_st_ob = document.getElementById('span_fill_'+c_min)
      var gen_en_ob = document.getElementById('span_fill_'+c_max)
      var en_ob = document.getElementById('span_fill_'+(this.props.mother_state.total_length-1))
      // console.log('obs', en_ob, st_ob, gen_st_ob, gen_en_ob)
      if(st_ob!==null && gen_st_ob!==null && gen_en_ob!==null && en_ob!==null){
        var start_px = st_ob.getBoundingClientRect().top
        var gen_start_px = gen_st_ob.getBoundingClientRect().top
        var gen_end_px = gen_en_ob.getBoundingClientRect().bottom
        var end_px = en_ob.getBoundingClientRect().bottom
      
        headBarH = (gen_start_px-start_px-4<0)?0:gen_start_px-start_px-4
        generatedBarH = (gen_end_px-gen_start_px-4<0)?0:gen_end_px-gen_start_px
        tailBarH = (end_px-gen_end_px-4<0)?0:end_px-gen_end_px-4
      } else{
        headBarH = 0
        generatedBarH = 0
        tailBarH = 0
      }
      
      
    }
    

    var barGap = '4px'

    return(
      <div id='sentence_indicator_container' 
        style={{position:'relative', marginLeft:'-20px', width:'10px', paddingTop:'4px'}}>
        
        <div id='existing_sentence_indicator_front' 
          style={{width:'8px', height: headBarH, borderRadius:'5px', backgroundColor:'rgba(153, 153, 153, 1)'}}/>
        <div id='new_sentence_indicator' 
          style={{width:'8px', height:generatedBarH, borderRadius:'5px', backgroundColor:'rgba(84, 160, 248, 1)', marginTop:barGap}}/>
        <div id='existing_sentence_indicator_back' 
          style={{width:'8px', height:tailBarH, borderRadius:'5px', backgroundColor:'rgba(153, 153, 153, 1)', marginTop:barGap}}/>
      </div>
    )
  }
  
  render() {
    var cur_path_name = this.props.mother_state.generated_names[this.props.mother_state.cur_path_id]
    if(cur_path_name==undefined){
      cur_path_name = this.props.mother_state.cur_path_id
    }

    return (
        <div className='noselect' style={{
          position:'relative', 
          height: '100%', marginLeft: '12%', marginRight: '8%'}} onPointerMove={this.IndicatorMove.bind(this)} onPointerUp={this.IndicatorMoveEnd.bind(this)}>
            {/* <div style={{position:'absolute', left:'-25px', top:'-50px', bottom: '-45px', width: 3}} onPointerEnter={this.IndicatorMoveEnd.bind(this)}></div> */}
            
            {/* <div className='row' style={{
                position:'fixed',
                marginTop:'2px',
                marginLeft:'38%',
                marginBottom:'8px'}}>
                
                <div className='col s12'>
                  {this.renderCharacters()}
                </div>
            </div> */}

            <div style={{position:'relative', margin:'auto', flexDirection:'row'}}>
              


              <div style={{display: 'inline-block', verticalAlign:'middle', width:'75%'}}>
                <TextareaAutosize type='text' onChange={this.handleChange} value={this.state.content} minRows={1} placeholder='Title' style={{border: 'none', resize: 'none', overflow:'hidden', fontFamily: 'Noto Sans', fontSize: '26px', fontWeight: '600', lineHeight: '160%', width:'100%', color: 'rgba(10, 10, 10, 0.80)'}} data-gramm_editor="false"></TextareaAutosize>
              </div>

                
              <div 
                onMouseOver={(event) =>{if(this.props.mother_state.being_generated==false){document.getElementById("history").src=history_hover}}}
                onMouseOut={(event) =>{ document.getElementById("history").src=history_default}} onPointerUp={this.toggleDropdown.bind(this)}
                disabled={this.props.mother_state.being_generated}
                style={{display: 'inline-block', width:'16%', float:'right', verticalAlign:'bottom'}}>

                <img src={history_less} style={{position:'absolute', width: '120px', display: (this.props.mother_state.dropdown)?'':'none'}} />

                <a style={{display: 'block', verticalAlign:'middle', float:'left'}}>
                  <img id='history' src={history_default} style={{
                    display: 'inline-block', verticalAlign:'bottom', marginTop:'0%', width: '120px', visibility:'visible'
                    }}/>
                </a>
                {/* <a class='btn' style={{fontSize:'14px'}} onPointerDown={this.toggleDropdown.bind(this)} disabled={this.props.mother_state.being_generated}>Generated: {cur_path_name}</a> */}
                <ul id='dropdown1' style={{position:'absolute', marginLeft:'-40%', marginTop:'44px', display: (this.props.mother_state.dropdown)?'':'none', backgroundColor:'white', width:'60%', zIndex: '10', padding: '10px', border:'solid 10px rgb(248, 248, 248)', borderRadius:'16px', background:'rgba(248, 248, 248, 0.96)'}}>
                  {this.renderGenerated()}
                </ul>
              </div>
              
            </div>

            <div style={{position:'relative', marginTop:'20px'}}>
              <div id='textarea_prompt' className='commonText' style={{height: 'fit-content', border: 'none', color:'transparent', overflowY:'auto', fontFamily: 'Noto Sans', fontSize: '16px', fontWeight: '400', lineHeight: '180%', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak:'break-word', lineHeight:'200%'}}></div>
              
              <TextareaAutosize id='textarea' className='commonText' value={this.props.mother_state.text} 
              style={{border: 'none', resize: 'none', overflow:'hidden', fontFamily: 'Noto Sans', fontSize: '16px', fontWeight: '400', lineHeight: '200%', touchAction:'auto'}} onFocus={this.checkCharacterName.bind(this)} onPointerUp={this.processDecideHighlightedSentence.bind(this, undefined, true)} onBlur={this.onBlurProcess.bind(this)} 
              onChange={this.storeAndParseSentences.bind(this)} onScroll={this.adjustScrollHeight.bind(this)} onKeyUp={this.keydownprocessDecideHighlightedSentence.bind(this)} disabled={this.props.mother_state.being_generated}></TextareaAutosize>
              {/* <div type='btn' style={{position: 'absolute', height: '40px', bottom:'0px', textAlign: 'center', borderRadius:'5px', backgroundColor:'#008800', color: 'white', padding:'8px'}}
                onPointerDown={this.setPromptPosition.bind(this)}
              >Set before the cursor as prompt.</div> */}

              {this.renderSentenceIndicator()}


              <div class="preloader-wrapper active" style={{position:'relative', top: 'calc(50% + 0px)', left: 'calc(50% - 33px)', display:(this.props.mother_state.being_generated)?'':'none'}}>
                <div class="spinner-layer spinner-red-only">
                  <div class="circle-clipper left">
                    <div class="circle"></div>
                  </div>
                  <div class="gap-patch">
                    <div class="circle"></div>
                  </div>
                  <div class="circle-clipper right">
                    <div class="circle"></div>
                  </div>
                </div>
              </div>

            </div>
            
        </div>
    )
  }
}