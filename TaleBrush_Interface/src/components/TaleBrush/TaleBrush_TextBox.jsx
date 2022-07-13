// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

import React from 'react';
import M from 'materialize-css'
import TaleBrush_TextBox_Text from './TaleBrush_TextBox_Text';
import TaleBrush_TextBox_Param from './TaleBrush_TextBox_Param';
import logo from '../../img/logo.png';

export default class TaleBrush_TextBox extends React.Component {
    // componentDidMount(){
    //     M.Tabs.init(document.querySelector('.tabs'))
    // }

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
        <div className={(this.props.is_baseline)?'col s8':'col s6'} style={{
            width:'55%', height:'100%', display: 'flex', flexDirection: 'column'
            }}>
            <div id='logo_bar' style={{position:'fixed', 
                width:'inherit', height:'72px', backgroundColor:'white',
                marginLeft:'-11.25px', zIndex:'1'}}>
                <img src={logo} style={{
                height: '20px', marginLeft: '32px', marginTop: '32px'
                }}/>
            </div>
            
            <div style={{flex: 'auto', height: '100%', marginTop:'100px'}}>
                
                <div id="test1" class="col s12" style={{
                    height: 'calc(100% - 90px)', marginTop:'30px'}}>
                    <TaleBrush_TextBox_Text mother_state={this.props.mother_state} mother_this={this.props.mother_this}></TaleBrush_TextBox_Text>
                </div>
                
                {/* <div id="test2" class="col s12"><TaleBrush_TextBox_Param mother_state={this.props.mother_state} mother_this={this.props.mother_this}></TaleBrush_TextBox_Param></div> */}
                
            </div>

            <div className='col s12' style={{
                    position:'fixed',
                    marginLeft:'58.5%', bottom:'120px', zIndex:'1'
                }}>
                    <div style={{display:'inline-block', marginLeft:'10px', display:'none'}}>
                        <label>
                            <input type='checkbox' id='surprise_check_size' value={this.props.mother_state.surprise_in_size} onChange={this.setSurpriseAsDuration.bind(this)}></input>
                            <span style={{paddingLeft: '25px'}}>Surprise as stroke size/duration.</span>
                        </label>
                    </div>
                    <div style={{display:'inline-block'}}>
                        <label>
                            <input type='checkbox' id='surprise_check_panel' value={this.props.mother_state.surprise_in_panel} onChange={this.setSurpriseAsPanel.bind(this)}></input>
                            <span style={{paddingLeft: '25px'}}>Surprise in separate panel.</span>
                        </label>
                    </div>
            </div>
            
        </div>
    )
  }
}