import type { Meta, StoryObj } from '@storybook/react';
import { Ring, AgendaRows, Cover, Card, Progress } from './components';
import { CalendarDays } from 'lucide-react';
const meta={title:'V4/Components',component:Ring} satisfies Meta<typeof Ring>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Timer:Story={args:{seconds:1500,total:1500,label:'Leitura'},render:args=><div style={{width:300}}><Ring {...args}/></div>};
export const Agenda:Story={render:()=> <div style={{width:420}}><Card title="Agenda de hoje" icon={CalendarDays}><AgendaRows/></Card></div>};
export const Reading:Story={render:()=> <div className="reading-body" style={{width:260}}><Cover/><div className="book-info"><b>Clean Architecture</b><Progress value={17}/><small>Página 72 de 432</small></div></div>};
