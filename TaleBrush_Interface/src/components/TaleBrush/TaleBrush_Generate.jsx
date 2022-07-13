// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import axios from 'axios'

var video_cont = ['She was very shy about singing and acting at school.',
    'When she found an audition for a musical during summer vacation, she decided to try out.',
    'She sang the role of a girl named Donna in her second attempt at music.',
    'After so much work and determination on the part, Emma earned success!',
    'She received offers from several companies to sing locally over summer vacation.',
    'Unfortunately, she lost all of her dreams as well as many potential opportunities due to this loss of confidence in her singing ability and inability to hold auditions with teachers or coaches for upcoming auditions.',
    'Now Emma no longer wants to pursue singing because of this incident.'
    ]
var video_cont_val = [0.3882, 0.6104, 0.9438, 1, 0.6865, 0.4189, 0.2401]
var video_cont_idx = 0


var video_cont_e = ['She barely sang that day as others took seats in the auditorium waiting their turn.',
    'She never went on stage again after that day!'
    ]
var video_cont_e_val = [0.243, 0.122]
var video_cont_e_idx = 0

var val_infill = [
    "When the opportunity came up less than a month later, Emma didn't know how to prepare herself properly or how much practice would be necessary before actually auditioning.",
    "She got upset when there were no teachers at school who would help prepare her vocal skills needed for auditions.",
    "She did so little preparation and by the time it came time, all her hopes fell through ashes when there were too many other interested singers vying for slots along with herself."
]
var val_infill_idxs = [2, 0, 1]
var val_infill_val = [0.4141, 0.42, 0.2500]
var val_infill_idx = 0

export function fortuneRecognition(_this, idx, character){
    var idx_min = parseInt(idx)-1
    if (idx_min<0){
        idx_min = 0
    }
        // var idx_min = 0
    var pre_context = ''
        // console.log(this.props.mother_state.text_parsed[this.props.mother_state.cur_path_id])
    for(var j=idx_min; j<idx; j++){
        // console.log(j)
        if(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][j]['sentence']=='' || _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][j]['sentence']==undefined){
            pre_context = ''
        }else{
            pre_context = pre_context + _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][j]['sentence']
        }
    }

        axios('/api/labelSentence', {
          method: 'POST',
          data: {
            sentence: _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][idx]['sentence'],
            pre_context:pre_context,
            character: _this.props.mother_state.characters[0]['name'],
          }
        })
        .then(function(response){
          console.log(response['data'])
          _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][idx][character['_id']] = response['data']['value']/100
          _this.props.mother_this.setState({}, function(){
            _this.props.mother_this.storeState('text_update')
            _this.props.mother_this.highlightSentence(_this.props.mother_state.text, _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id])
          })
          
        })
}


function insertASentenceToTextbox(_this, idx){
    var text = document.getElementById('textarea').value
    // console.log('cur_path_id', _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id], idx)
    var sentence = _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][parseInt(idx)]['sentence']
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
    // console.log(new_text)
    _this.props.mother_this.setState({text:new_text}, function(){
        _this.props.mother_this.highlightSentence(new_text, _this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id])
    })
  }

function getNewPathId(_this){
    var key_list = Object.keys(_this.props.mother_state.text_parsed)

    var cur_key = _this.props.mother_state.cur_path_id.split('-')

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
    // console.log(next_candidate, Math.max(...next_candidate))
    if(next_candidate.length==0){
        nc = 0
    }else{
        nc = Math.max(...next_candidate)+1
    }


    return _this.props.mother_state.cur_path_id+'-'+nc

}

function continuing_call(_this, pre_context, controls, characters, temperature, regeneration, new_key, init_idx, pick_ids){
    if(controls.length==0){
        _this.props.mother_this.setState({being_generated:false}, function(){
            _this.props.mother_this.storeState('generate_continuation')
        })
        
        return
    }else{
        var control = controls.shift()
        var temp = temperature.shift()
        var regen = regeneration.shift()

        /////////// when machine not connecte ////
        // var generated = ['generated']
        // var values = [Math.random()]
        
        // var text_parsed_new = JSON.parse(JSON.stringify(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]))
    
        // for(var i in generated){
        //     i = parseInt(i)
        //     console.log(i+init_idx+1, i)
        //     pre_context.push(generated[i])
        //     if(pick_ids.length==0 || pick_ids.indexOf(i+init_idx+1)!=-1){
        //         text_parsed_new[i+init_idx+1]={
        //             'sentence': generated[i],
        //             'protagonist': values[i],
        //         }
        //     }
            
            
        //     // document.getElementById('sentence_box_'+(i+front_end+1).toString()).value = generated[i]
        // }
        // _this.props.mother_state.text_parsed[new_key] = text_parsed_new
        // console.log('new parsed',_this.props.mother_state.text_parsed)
        // _this.props.mother_this.setState({cur_path_id:new_key}, function(){
        //     if(pick_ids.length==0 || pick_ids.indexOf(i+init_idx+1)!=-1){
        //         insertASentenceToTextbox(_this, init_idx+1)
        //     }
            
        //     continuing_call(_this, pre_context, controls, characters, temperature, new_key, init_idx+1, pick_ids)
        // })
        
        
        // return
        ///////////


        ///////////////////// Below when machine is connecte
        if(_this.props.mother_state.video==false){
            axios('/api/continuingGeneration', {
                method: 'POST',
                data: {
                    pre_context: JSON.stringify(pre_context),
                    controls: JSON.stringify([control]),
                    characters: JSON.stringify(characters),
                    temperature: JSON.stringify([temp]),
                    regeneration: JSON.stringify([regen]),
                }
            })
            .then(function(response){
                var generated = JSON.parse(response.data['generated'])
                var values = JSON.parse(response.data['values'])
                
                var text_parsed_new = JSON.parse(JSON.stringify(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]))
            
                for(var i in generated){
                    i = parseInt(i)
                    // console.log(i+init_idx+1, i)
                    pre_context.push(generated[i])
                    if(pick_ids.length==0 || pick_ids.indexOf(i+init_idx+1)!=-1){
                        text_parsed_new[i+init_idx+1]={
                            'sentence': generated[i],
                            'protagonist': values[i]/100,
                        }
                    }
                    
                    // document.getElementById('sentence_box_'+(i+front_end+1).toString()).value = generated[i]
                }
                _this.props.mother_state.text_parsed[new_key] = text_parsed_new
                // console.log(_this.props.mother_state.text_parsed)
                _this.props.mother_this.setState({cur_path_id:new_key}, function(){
                    if(pick_ids.length==0 || pick_ids.indexOf(i+init_idx+1)!=-1){
                        insertASentenceToTextbox(_this, init_idx+1)
                    }
                    continuing_call(_this, pre_context, controls, characters, temperature, regeneration, new_key, init_idx+1, pick_ids)
                })
                
                // _this.continuing_call(pre_context, controls, characters, temperature, new_key, init_idx+1)
            }).catch(function(error){
                alert('Error occurred while generating!')
                _this.props.mother_this.setState({being_generated:false})
            })
            ///////////////////////////
        }else{
            setTimeout(function(){
                if(control!='-1'){
                    var generated = [video_cont[video_cont_idx]]
                    var values = [video_cont_val[video_cont_idx]]
                    video_cont_idx = video_cont_idx+1
                }else{
                    var generated = [video_cont_e[video_cont_e_idx]]
                    var values = [video_cont_e_val[video_cont_e_idx]]
                    video_cont_e_idx = video_cont_e_idx+1
                }
                
                
                var text_parsed_new = JSON.parse(JSON.stringify(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]))
            
                for(var i in generated){
                    i = parseInt(i)
                    // console.log(i+init_idx+1, i)
                    pre_context.push(generated[i])
                    if(pick_ids.length==0 || pick_ids.indexOf(i+init_idx+1)!=-1){
                        text_parsed_new[i+init_idx+1]={
                            'sentence': generated[i],
                            'protagonist': values[i],
                        }
                    }
                    
                    // document.getElementById('sentence_box_'+(i+front_end+1).toString()).value = generated[i]
                }
                _this.props.mother_state.text_parsed[new_key] = text_parsed_new
                // console.log(_this.props.mother_state.text_parsed)
                _this.props.mother_this.setState({cur_path_id:new_key}, function(){
                    if(pick_ids.length==0 || pick_ids.indexOf(i+init_idx+1)!=-1){
                        insertASentenceToTextbox(_this, init_idx+1)
                    }
                    continuing_call(_this, pre_context, controls, characters, temperature, regeneration, new_key, init_idx+1, pick_ids)
                })
            }, 1000)

        }
        
    }
    
  }

 export function continuing_generation(_this, front_start, front_end, gen_end, pick_ids = []){
    // var front_start = _this.props.mother_state.text_front_prompt_start
    // var front_end = _this.props.mother_state.text_front_prompt_end
    // var gen_end = _this.props.mother_state.text_generation_end
    var pre_context = []
    var controls = []
    var temperature = []
    var regeneration = []
    // var old_controls = JSON.parse(JSON.stringify(_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]))
    for(var i=front_start; i<=front_end; i++){
        if(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][i]['sentence']==''){
            alert('Please fill in the context.')
            return
        }
        pre_context.push(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][i]['sentence'])
    }
    for(var i=front_end+1; i<=gen_end; i++){
        if(_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['protagonist']!=undefined){
            if (_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['protagonist'][i]!=undefined){
                var cval = Math.round(_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['protagonist'][i]*100)
                controls.push(cval.toString())
            }else{
                controls.push('-1')
            }
        }else{
            controls.push('-1')
        }
        
        if(_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_surprise']!=undefined){
            if (_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_surprise'][i]!=undefined){
                var sval = _this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_surprise'][i]
                temperature.push(sval)
            }else{
                temperature.push(0.7)
            }
        }else{
            temperature.push(0.7)
        }

        if(_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_regeneration']!=undefined){
            if (_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_regeneration'][i]!=undefined){
                var rval = _this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_regeneration'][i]
                if(rval<2){
                    regeneration.push(1)
                }else{
                    regeneration.push(rval)
                }
                
            }else{
                regeneration.push(1)
            }
        }else{
            regeneration.push(1)
        }
        
    }
    var characters = [_this.props.mother_state.characters[0]['name']]
    // var gen_sen_num = gen_end-front_end
    // console.log(_this.props.mother_state.controls)
    // console.log(pre_context, controls, characters, temperature)
    
    var new_key = getNewPathId(_this)
    _this.props.mother_state.controls[new_key] = JSON.parse(JSON.stringify(_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]))
    _this.props.mother_state.text_parsed[new_key]=JSON.parse(JSON.stringify(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]))
    _this.props.mother_state.controls[_this.props.mother_state.cur_path_id] = _this.props.mother_state.old_controls
    
    _this.props.mother_this.setState({
        being_generated: true,
        cur_path_id: new_key,
    }, function(){
        
        continuing_call(_this, pre_context, controls, characters, temperature, regeneration, new_key, front_end, pick_ids)
    })
    
    return


  }

  function infilling_call(_this, pre_context, post_context, controls, characters, temperature, regeneration, new_key, front_idx, back_idx, is_front, pick_ids = []){
    // console.log('pick ids!', pick_ids)
    if(controls.length==0){
        _this.props.mother_this.setState({being_generated:false}, function(){
            _this.props.mother_this.storeState('generate_infilling')
        })
        
        return
    }else{
        var control, temp, regen
        // console.log(temperature)
        if(is_front){
            control = controls.shift()
            temp = temperature.shift()
            regen = regeneration.shift()
        }else{
            control = controls.pop()
            temp = temperature.pop()
            regen = regeneration.pop()
        }


        ////////////////
        // var generated = ['generated']
        // var values = [Math.random()]
        
        // var text_parsed_new = JSON.parse(JSON.stringify(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]))
    
        // for(var i in generated){
        //     i = parseInt(i)
        //     // console.log(i+init_idx+1, i)
        //     if(is_front){
        //         pre_context.push(generated[i])
        //         if(pick_ids.length==0 || pick_ids.indexOf(i+front_idx+1)!=-1){
        //             text_parsed_new[i+front_idx+1]={
        //                 'sentence': generated[i],
        //                 'protagonist': values[i],
        //             }
        //         }
                
        //     }else{
        //         post_context.unshift(generated[i])
        //         if(pick_ids.length==0 || pick_ids.indexOf(back_idx-generated.length+i)!=-1){
        //             text_parsed_new[back_idx-generated.length+i]={
        //                 'sentence': generated[i],
        //                 'protagonist': values[i],
        //             }
        //         }
        //     }
            
            
        //     // document.getElementById('sentence_box_'+(i+front_end+1).toString()).value = generated[i]
        // }
        // _this.props.mother_state.text_parsed[new_key] = text_parsed_new
        // // console.log('1',_this.props.mother_state.text_parsed)
        // _this.props.mother_this.setState({cur_path_id:new_key}, function(){
        //     if(is_front){
        //         if(pick_ids.length==0 || pick_ids.indexOf(i+front_idx+1)!=-1){
        //             insertASentenceToTextbox(_this, front_idx+1)
        //         }
        //         infilling_call(_this, pre_context, post_context, controls, characters, temperature, new_key, front_idx+1, back_idx, !is_front, pick_ids)
        //     }else{
        //         if(pick_ids.length==0 || pick_ids.indexOf(back_idx-generated.length+i)!=-1){
        //             insertASentenceToTextbox(_this, back_idx-1)
        //         }
        //         infilling_call(_this, pre_context, post_context, controls, characters, temperature, new_key, front_idx, back_idx-1, !is_front, pick_ids)
        //     }
        // })
        // return
        
        ////////////////

        if(_this.props.mother_state.video==false){
            ////////////////////////////// When connected to a machine, below
            axios('/api/infillingGeneration', {
                method: 'POST',
                data: {
                    pre_context: JSON.stringify(pre_context),
                    post_context: JSON.stringify(post_context),
                    controls: JSON.stringify([control]),
                    characters: JSON.stringify(characters),
                    temperature: JSON.stringify([temp]),
                    regeneration: JSON.stringify([regen]),
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
                        if(pick_ids.length==0 || pick_ids.indexOf(i+front_idx+1)!=-1){
                            text_parsed_new[i+front_idx+1]={
                                'sentence': generated[i],
                                'protagonist': values[i]/100,
                            }
                        }
                        
                    }else{
                        post_context.unshift(generated[i])
                        if(pick_ids.length==0 || pick_ids.indexOf(back_idx-generated.length+i)!=-1){
                            text_parsed_new[back_idx-generated.length+i]={
                                'sentence': generated[i],
                                'protagonist': values[i]/100,
                            }
                        }
                        
                    }
                    
                    
                    // document.getElementById('sentence_box_'+(i+front_end+1).toString()).value = generated[i]
                }
                _this.props.mother_state.text_parsed[new_key] = text_parsed_new
                // console.log('1',_this.props.mother_state.text_parsed)
                _this.props.mother_this.setState({cur_path_id:new_key}, function(){
                    if(is_front){
                        if(pick_ids.length==0 || pick_ids.indexOf(i+front_idx+1)!=-1){
                            insertASentenceToTextbox(_this, front_idx+1)
                        }
                        infilling_call(_this, pre_context, post_context, controls, characters, temperature, regeneration, new_key, front_idx+1, back_idx, !is_front, pick_ids)
                    }else{
                        if(pick_ids.length==0 || pick_ids.indexOf(back_idx-generated.length+i)!=-1){
                            insertASentenceToTextbox(_this, back_idx-1)
                        }
                        infilling_call(_this, pre_context, post_context, controls, characters, temperature, regeneration, new_key, front_idx, back_idx-1, !is_front, pick_ids)
                    }
                    
                })
                
            }).catch(function(error){
                alert('Error occurred while generating!')
                _this.props.mother_this.setState({being_generated:false})
            })
            ////////////////////////
        }else{
            setTimeout(function(){
                var generated = [val_infill[val_infill_idxs[val_infill_idx]]]
                var values = [val_infill_val[val_infill_idxs[val_infill_idx]]]
                val_infill_idx = val_infill_idx+1
                var text_parsed_new = JSON.parse(JSON.stringify(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]))
            
                for(var i in generated){
                    i = parseInt(i)
                    // console.log(i+init_idx+1, i)
                    if(is_front){
                        
                        pre_context.push(generated[i])
                        if(pick_ids.length==0 || pick_ids.indexOf(i+front_idx+1)!=-1){
                            text_parsed_new[i+front_idx+1]={
                                'sentence': generated[i],
                                'protagonist': values[i],
                            }
                        }
                        
                    }else{
                        post_context.unshift(generated[i])
                        if(pick_ids.length==0 || pick_ids.indexOf(back_idx-generated.length+i)!=-1){
                            text_parsed_new[back_idx-generated.length+i]={
                                'sentence': generated[i],
                                'protagonist': values[i],
                            }
                        }
                        
                    }
                    
                    
                    // document.getElementById('sentence_box_'+(i+front_end+1).toString()).value = generated[i]
                }
                _this.props.mother_state.text_parsed[new_key] = text_parsed_new
                // console.log('1',_this.props.mother_state.text_parsed)
                _this.props.mother_this.setState({cur_path_id:new_key}, function(){
                    if(is_front){
                        if(pick_ids.length==0 || pick_ids.indexOf(i+front_idx+1)!=-1){
                            insertASentenceToTextbox(_this, front_idx+1)
                        }
                        infilling_call(_this, pre_context, post_context, controls, characters, temperature, regeneration, new_key, front_idx+1, back_idx, !is_front, pick_ids)
                    }else{
                        if(pick_ids.length==0 || pick_ids.indexOf(back_idx-generated.length+i)!=-1){
                            insertASentenceToTextbox(_this, back_idx-1)
                        }
                        infilling_call(_this, pre_context, post_context, controls, characters, temperature, regeneration, new_key, front_idx, back_idx-1, !is_front, pick_ids)
                    }
                    
                })
                
            }, 1000)
        }
        
    }
  }


  export function infilling_generation(_this, front_start, front_end, back_start, back_end, pick_ids = []){


    var pre_context = []
    var post_context = []
    var controls = []
    var temperature = []
    var regeneration = []
    // console.log('infilling...')
    for(var i=front_start; i<=front_end; i++){
        if(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][i]['sentence']==''){
            alert('Please fill in the context.')
            return
        }
        pre_context.push(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][i]['sentence'])
    }
    for(var i=back_start; i<=back_end; i++){
        if(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][i]['sentence']==''){
            alert('Please fill in the context.')
            return
        }
        post_context.push(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id][i]['sentence'])
    }
    for(var i=front_end+1; i<back_start; i++){
        if(_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['protagonist']!=undefined){
            if (_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['protagonist'][i]!=undefined){
                var cval = Math.round(_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['protagonist'][i]*100)
                controls.push(cval.toString())
            }else{
                controls.push('-1')
            }
        }else{
            controls.push('-1')
        }

        if(_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_surprise']!=undefined){
            if (_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_surprise'][i]!=undefined){
                var sval = _this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_surprise'][i]
                temperature.push(sval)
            }else{
                temperature.push(0.7)
            }
        }else{
            temperature.push(0.7)
        }

        if(_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_regeneration']!=undefined){
            if (_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_regeneration'][i]!=undefined){
                var rval = _this.props.mother_state.controls[_this.props.mother_state.cur_path_id]['_regeneration'][i]
                if(rval<2){
                    regeneration.push(1)
                }else{
                    regeneration.push(rval)
                }
            }else{
                regeneration.push(1)
            }
        }else{
            regeneration.push(1)
        }
    }
    var characters = [_this.props.mother_state.characters[0]['name']]
    // var gen_sen_num = back_start-front_end-1
    // console.log(_this.props.mother_state.controls)
    // console.log(pre_context, post_context, controls, characters, temperature)

    // // when machine is not connected////////////
    var is_front = true
    if(pre_context.length>post_context.length){
        is_front = false
    }
    
    var new_key = getNewPathId(_this)
    _this.props.mother_state.controls[new_key] = JSON.parse(JSON.stringify(_this.props.mother_state.controls[_this.props.mother_state.cur_path_id]))
    _this.props.mother_state.text_parsed[new_key]=JSON.parse(JSON.stringify(_this.props.mother_state.text_parsed[_this.props.mother_state.cur_path_id]))
    _this.props.mother_state.controls[_this.props.mother_state.cur_path_id] = _this.props.mother_state.old_controls
    _this.props.mother_this.setState({
        being_generated: true,
        cur_path_id: new_key,
    }, function(){
        
        infilling_call(_this,pre_context, post_context, controls, characters, temperature, regeneration, new_key, front_end, back_start, is_front, pick_ids)
    })
    return
    ////////////////////////////////////////////


    var is_front = true
    if(pre_context.length>post_context.length){
        is_front = false
    }

    var new_key = _this.getNewPathId(_this)
    _this.props.mother_this.setState({
        being_generated: true
    }, function(){
        _this.infilling_call(_this, pre_context, post_context, controls, characters, temperature, new_key, front_end, back_start, is_front, pick_ids)
    })
    
    return
    

  }

