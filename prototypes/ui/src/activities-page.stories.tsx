import { useState } from 'react';
import type { Meta,StoryObj } from '@storybook/react';
import { ActivitiesPage } from './activities-page';
import { initialBooks,initialCategories,initialTasks } from './activity-model';
function Example(){const [categories,setCategories]=useState(initialCategories);const [tasks,setTasks]=useState(initialTasks);const [books,setBooks]=useState(initialBooks);const [selection,setSelection]=useState('');return <div style={{padding:20}}><ActivitiesPage categories={categories} tasks={tasks} books={books} onCategories={setCategories} onTasks={setTasks} onBooks={setBooks} onFocus={c=>setSelection(c.title)} onReading={b=>setSelection(b.title)}/>{selection&&<p>Selecionado: {selection}</p>}</div>}
const meta={title:'V4/Screens/Activities',component:Example,parameters:{layout:'fullscreen'}} satisfies Meta<typeof Example>;
export default meta;
export const Default:StoryObj<typeof meta>={};
