// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import axios from 'axios'

// Readable message for a failed API call (server returns {error: ...} on LLM/provider failures).
function errorMessage(error){
    if(error.response && error.response.data && error.response.data.error){
        return error.response.data.error
    }
    return error.message || 'Error occurred while generating!'
}

// The relationship track only takes part when it is shown and both characters exist.
export function relationshipActive(state){
    return state.relationship_in_panel==true && state.characters.length==2
}

// {name: 0-100 or -1 (no target), _relationship?: 0-100} for sentence i of the current path.
function collectTargets(state, i){
    var controls = state.controls[state.cur_path_id]
    var targets = {}
    state.characters.forEach(function(c){
        var v = controls[c['_id']]!=undefined ? controls[c['_id']][i] : undefined
        targets[c['name']] = (v!=undefined) ? Math.round(v*100) : -1
    })
    if(relationshipActive(state) && controls['_relationship']!=undefined && controls['_relationship'][i]!=undefined){
        targets['_relationship'] = Math.round(controls['_relationship'][i]*100)
    }
    return targets
}

// Shared tracks: temperature from _surprise, retries from _regeneration.
function collectShared(state, i){
    var controls = state.controls[state.cur_path_id]
    var temp = (controls['_surprise']!=undefined && controls['_surprise'][i]!=undefined) ? controls['_surprise'][i] : 0.7
    var rval = (controls['_regeneration']!=undefined) ? controls['_regeneration'][i] : undefined
    return {temp: temp, regen: (rval==undefined || rval<2) ? 1 : rval}
}

// Store a returned {name: 0-100, relationship: n} rating dict into a text_parsed row under character ids.
function applyValues(state, row, values){
    state.characters.forEach(function(c){
        if(values[c['name']]!=undefined){
            row[c['_id']] = values[c['name']]/100
        }
    })
    if(relationshipActive(state) && values['relationship']!=undefined){
        row['_relationship'] = values['relationship']/100
    }
}

// Ratings (0-100, by name) of an already rated sentence; lets the prompt say rising/falling/steady.
function prevValues(state, idx){
    var row = state.text_parsed[state.cur_path_id][idx]
    var prev = {}
    if(row==undefined){
        return prev
    }
    state.characters.forEach(function(c){
        if(row[c['_id']]!=undefined){
            prev[c['name']] = Math.round(row[c['_id']]*100)
        }
    })
    if(row['_relationship']!=undefined){
        prev['relationship'] = Math.round(row['_relationship']*100)
    }
    return prev
}

// True when a non-empty sentence still lacks a rating for any character (or the relationship).
export function needsRating(state, row){
    if(row==undefined || row['sentence']==undefined || row['sentence'].length<=1){
        return false
    }
    var missing = state.characters.some(function(c){ return row[c['_id']]==undefined })
    return missing || (relationshipActive(state) && row['_relationship']==undefined)
}

// One labelSentence call rates the sentence for every character (and the relationship).
export function fortuneRecognition(_this, idx){
    var state = _this.props.mother_state
    var path_id = state.cur_path_id
    var idx_min = parseInt(idx)-1
    if (idx_min<0){
        idx_min = 0
    }
    var pre_context = ''
    for(var j=idx_min; j<idx; j++){
        if(state.text_parsed[path_id][j]['sentence']=='' || state.text_parsed[path_id][j]['sentence']==undefined){
            pre_context = ''
        }else{
            pre_context = pre_context + state.text_parsed[path_id][j]['sentence']
        }
    }

    axios('/api/labelSentence', {
      method: 'POST',
      data: {
        sentence: state.text_parsed[path_id][idx]['sentence'],
        pre_context: pre_context,
        characters: state.characters.map(function(c){ return c['name'] }),
        include_relationship: relationshipActive(state),
      }
    })
    .then(function(response){
      applyValues(state, state.text_parsed[path_id][idx], response['data']['values'])
      _this.props.mother_this.setState({}, function(){
        _this.props.mother_this.storeState('text_update')
        _this.props.mother_this.highlightSentence(state.text, state.text_parsed[path_id])
      })
    }).catch(function(error){
      alert(errorMessage(error))
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
    }
    var control = controls.shift()
    var temp = temperature.shift()
    var regen = regeneration.shift()

    axios('/api/continuingGeneration', {
        method: 'POST',
        data: {
            pre_context: JSON.stringify(pre_context),
            controls: JSON.stringify([control]),
            characters: JSON.stringify(characters),
            temperature: JSON.stringify([temp]),
            regeneration: JSON.stringify([regen]),
            prev_values: prevValues(_this.props.mother_state, init_idx),
        }
    })
    .then(function(response){
        var generated = JSON.parse(response.data['generated'])
        var values = JSON.parse(response.data['values'])
        var state = _this.props.mother_state

        var text_parsed_new = JSON.parse(JSON.stringify(state.text_parsed[state.cur_path_id]))

        for(var i in generated){
            i = parseInt(i)
            pre_context.push(generated[i])
            if(pick_ids.length==0 || pick_ids.indexOf(i+init_idx+1)!=-1){
                text_parsed_new[i+init_idx+1] = {'sentence': generated[i]}
                applyValues(state, text_parsed_new[i+init_idx+1], values[i])
            }
        }
        state.text_parsed[new_key] = text_parsed_new
        _this.props.mother_this.setState({cur_path_id:new_key}, function(){
            if(pick_ids.length==0 || pick_ids.indexOf(i+init_idx+1)!=-1){
                insertASentenceToTextbox(_this, init_idx+1)
            }
            continuing_call(_this, pre_context, controls, characters, temperature, regeneration, new_key, init_idx+1, pick_ids)
        })
    }).catch(function(error){
        alert(errorMessage(error))
        _this.props.mother_this.setState({being_generated:false}, function(){
            _this.props.mother_this.storeState('generate_error')
        })
    })
}

// Fill controls/temperature/regeneration lists for sentences from..to-1 (shared by both modes).
function collectControls(state, from, to){
    var controls = [], temperature = [], regeneration = []
    for(var i=from; i<to; i++){
        controls.push(collectTargets(state, i))
        var shared = collectShared(state, i)
        temperature.push(shared.temp)
        regeneration.push(shared.regen)
    }
    return {controls: controls, temperature: temperature, regeneration: regeneration}
}

// Branch: copy every track/layer of the current path to a new path id; current path gets its pre-stroke controls back.
function branchPath(_this){
    var state = _this.props.mother_state
    var new_key = getNewPathId(_this)
    state.controls[new_key] = JSON.parse(JSON.stringify(state.controls[state.cur_path_id]))
    state.text_parsed[new_key] = JSON.parse(JSON.stringify(state.text_parsed[state.cur_path_id]))
    state.controls[state.cur_path_id] = state.old_controls
    return new_key
}

function contextSentences(state, from, to){
    var out = []
    for(var i=from; i<=to; i++){
        if(state.text_parsed[state.cur_path_id][i]['sentence']==''){
            alert('Please fill in the context.')
            return undefined
        }
        out.push(state.text_parsed[state.cur_path_id][i]['sentence'])
    }
    return out
}

function characterNames(state){
    return state.characters.map(function(c){ return c['name'] })
}

export function continuing_generation(_this, front_start, front_end, gen_end, pick_ids = []){
    var state = _this.props.mother_state
    var pre_context = contextSentences(state, front_start, front_end)
    if(pre_context==undefined){
        return
    }
    var c = collectControls(state, front_end+1, gen_end+1)
    var new_key = branchPath(_this)

    _this.props.mother_this.setState({
        being_generated: true,
        cur_path_id: new_key,
    }, function(){
        continuing_call(_this, pre_context, c.controls, characterNames(state), c.temperature, c.regeneration, new_key, front_end, pick_ids)
    })
}

function infilling_call(_this, pre_context, post_context, controls, characters, temperature, regeneration, new_key, front_idx, back_idx, is_front, pick_ids = []){
    if(controls.length==0){
        _this.props.mother_this.setState({being_generated:false}, function(){
            _this.props.mother_this.storeState('generate_infilling')
        })
        return
    }
    var control, temp, regen
    if(is_front){
        control = controls.shift()
        temp = temperature.shift()
        regen = regeneration.shift()
    }else{
        control = controls.pop()
        temp = temperature.pop()
        regen = regeneration.pop()
    }

    axios('/api/infillingGeneration', {
        method: 'POST',
        data: {
            pre_context: JSON.stringify(pre_context),
            post_context: JSON.stringify(post_context),
            controls: JSON.stringify([control]),
            characters: JSON.stringify(characters),
            temperature: JSON.stringify([temp]),
            regeneration: JSON.stringify([regen]),
            is_front: is_front,
            prev_values: is_front ? prevValues(_this.props.mother_state, front_idx) : {},
        }
    })
    .then(function(response){
        var generated = JSON.parse(response.data['generated'])
        var values = JSON.parse(response.data['values'])
        var state = _this.props.mother_state

        var text_parsed_new = JSON.parse(JSON.stringify(state.text_parsed[state.cur_path_id]))

        for(var i in generated){
            i = parseInt(i)
            var target_idx
            if(is_front){
                pre_context.push(generated[i])
                target_idx = i+front_idx+1
            }else{
                post_context.unshift(generated[i])
                target_idx = back_idx-generated.length+i
            }
            if(pick_ids.length==0 || pick_ids.indexOf(target_idx)!=-1){
                text_parsed_new[target_idx] = {'sentence': generated[i]}
                applyValues(state, text_parsed_new[target_idx], values[i])
            }
        }
        state.text_parsed[new_key] = text_parsed_new
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
        alert(errorMessage(error))
        _this.props.mother_this.setState({being_generated:false}, function(){
            _this.props.mother_this.storeState('generate_error')
        })
    })
}

export function infilling_generation(_this, front_start, front_end, back_start, back_end, pick_ids = []){
    var state = _this.props.mother_state
    var pre_context = contextSentences(state, front_start, front_end)
    if(pre_context==undefined){
        return
    }
    var post_context = contextSentences(state, back_start, back_end)
    if(post_context==undefined){
        return
    }
    var c = collectControls(state, front_end+1, back_start)
    var is_front = !(pre_context.length>post_context.length)
    var new_key = branchPath(_this)

    _this.props.mother_this.setState({
        being_generated: true,
        cur_path_id: new_key,
    }, function(){
        infilling_call(_this, pre_context, post_context, c.controls, characterNames(state), c.temperature, c.regeneration, new_key, front_end, back_start, is_front, pick_ids)
    })
}
