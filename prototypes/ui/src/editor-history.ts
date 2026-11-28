import {useReducer,type SetStateAction} from 'react';
import type {Widget} from './model';
type Snapshot=Widget[]|null;
type State={past:Widget[][];present:Snapshot;future:Widget[][]};
type Action={type:'begin';value:Snapshot}|{type:'change';value:SetStateAction<Snapshot>}|{type:'undo'|'redo'};
const initial:State={past:[],present:null,future:[]};
function reducer(state:State,action:Action):State{
 if(action.type==='begin')return {past:[],present:action.value,future:[]};
 if(action.type==='undo'){if(!state.present||!state.past.length)return state;return {past:state.past.slice(0,-1),present:state.past[state.past.length-1],future:[state.present,...state.future]}}
 if(action.type==='redo'){if(!state.present||!state.future.length)return state;return {past:[...state.past,state.present].slice(-40),present:state.future[0],future:state.future.slice(1)}}
 if(action.type==='change'){
  const next=typeof action.value==='function'?action.value(state.present):action.value;
  if(JSON.stringify(next)===JSON.stringify(state.present))return state;
  if(!state.present||!next)return {past:[],present:next,future:[]};
  return {past:[...state.past,state.present].slice(-40),present:next,future:[]};
 }
 return state;
}
export function useEditorHistory(){
 const [state,dispatch]=useReducer(reducer,initial);
 return {draft:state.present,setDraft:(value:SetStateAction<Snapshot>)=>dispatch({type:'change',value}),begin:(value:Snapshot)=>dispatch({type:'begin',value}),undo:()=>dispatch({type:'undo'}),redo:()=>dispatch({type:'redo'}),canUndo:state.past.length>0,canRedo:state.future.length>0};
}
