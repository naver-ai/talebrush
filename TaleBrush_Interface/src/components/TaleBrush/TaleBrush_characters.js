// TaleBrush 
// Copyright (c) 2022-present NAVER Corp.
// GPLv3

// Raise MAX_CHARACTERS and add a palette below to support more characters.
export const MAX_CHARACTERS = 2

// First palette = the original TaleBrush green/grey/blue, so a single character looks unchanged.
// `color` identifies a character's palette (stored on the character); the rest feed TaleBrush_Canvas_SenVis_Seq.
export const PALETTES = [
  {color:'#0F924E', control_color:'#0F924E', control_color_new:'#7AE1AC', generated_color:'#999795', generated_color_new:'#54A0F8'},
  {color:'#8E44AD', control_color:'#8E44AD', control_color_new:'#D2A8E6', generated_color:'#A39AAB', generated_color_new:'#C25BB5'},
]

export const RELATIONSHIP_PALETTE = {color:'#D6457A', control_color:'#D6457A', control_color_new:'#F2A0BF', generated_color:'#A8999F', generated_color_new:'#E0608F'}

export function paletteFor(character){
  for(var i in PALETTES){
    if(PALETTES[i].color==character['color']){
      return PALETTES[i]
    }
  }
  return PALETTES[0]
}

// First palette colour not used by an existing character.
export function nextColor(characters){
  for(var i in PALETTES){
    if(characters.every(function(c){ return c['color']!=PALETTES[i].color })){
      return PALETTES[i].color
    }
  }
  return PALETTES[0].color
}
