import type { Meta,StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button,Field,SelectField,Dialog } from './ui';
const meta={title:'V4/Primitives/Forms',component:Button} satisfies Meta<typeof Button>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Controls:Story={args:{children:'Salvar'},render:()=> <div style={{width:320,display:'grid',gap:16}}><div style={{display:'flex',gap:8}}><Button>Salvar</Button><Button variant="secondary">Cancelar</Button><Button variant="soft" size="sm">Continuar</Button></div><Field label="Página atual" type="number" defaultValue={72} hint="De 0 a 432 páginas."/><SelectField label="Duração do Pomodoro" defaultValue="25"><option value="25">25 minutos</option><option value="50">50 minutos</option></SelectField></div>};
function DialogExample(){const [open,setOpen]=useState(false);return <><Button onClick={()=>setOpen(true)}>Abrir diálogo</Button>{open&&<Dialog title="Atualizar progresso" description="Registre onde você parou." onDismiss={()=>setOpen(false)}><div className="dialog-form"><Field label="Página atual" defaultValue={72} type="number"/><footer className="dialog-actions"><Button variant="secondary" onClick={()=>setOpen(false)}>Cancelar</Button><Button onClick={()=>setOpen(false)}>Salvar</Button></footer></div></Dialog>}</>}
export const Modal:Story={args:{children:'Abrir'},render:()=> <DialogExample/>};
