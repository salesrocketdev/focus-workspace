import type { Meta,StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button,Field,SelectField,Dialog,ToggleCard,SearchField } from './ui';
const meta={title:'V4/Primitives/Forms',component:Button} satisfies Meta<typeof Button>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Controls:Story={args:{children:'Salvar'},render:()=> <div style={{width:320,display:'grid',gap:16}}><div style={{display:'flex',gap:8}}><Button>Salvar</Button><Button variant="secondary">Cancelar</Button><Button variant="soft" size="sm">Continuar</Button></div><Field label="Página atual" type="number" defaultValue={72} hint="De 0 a 432 páginas."/><SelectField label="Duração do Pomodoro" defaultValue="25" options={[{value:'25',label:'25 minutos'},{value:'50',label:'50 minutos'}]}/><Field label="Título da tarefa" placeholder="Digite um título" error="Informe um título."/><Field label="Campo bloqueado" disabled defaultValue="Indisponível"/></div>};
function DialogExample(){const [open,setOpen]=useState(false);return <><Button onClick={()=>setOpen(true)}>Abrir diálogo</Button>{open&&<Dialog title="Atualizar progresso" description="Registre onde você parou." onDismiss={()=>setOpen(false)}><div className="dialog-form"><Field label="Página atual" defaultValue={72} type="number"/><footer className="dialog-actions"><Button variant="secondary" onClick={()=>setOpen(false)}>Cancelar</Button><Button onClick={()=>setOpen(false)}>Salvar</Button></footer></div></Dialog>}</>}
export const Modal:Story={args:{children:'Abrir'},render:()=> <DialogExample/>};

function ToggleExample(){const [checked,setChecked]=useState(true),[query,setQuery]=useState('');return <div style={{width:320,display:'grid',gap:12}}><ToggleCard title="Iniciar pausas automaticamente" description="Ao terminar um período de foco." checked={checked} onChange={setChecked}/><ToggleCard title="Iniciar o próximo foco automaticamente" description="Ao terminar uma pausa." checked={!checked} onChange={v=>setChecked(!v)}/><ToggleCard title="Bloqueado" checked={false} disabled onChange={()=>{}}/><SearchField label="Buscar" value={query} onValueChange={setQuery} placeholder="Buscar..."/></div>}
export const ToggleCards:Story={args:{children:'Preferências'},render:()=> <ToggleExample/>};
