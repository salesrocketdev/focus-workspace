import type { Meta,StoryObj } from '@storybook/react';
import { CalendarPage } from './calendar-page';
const meta={title:'V4/Screens/Agenda',component:CalendarPage,parameters:{layout:'fullscreen'}} satisfies Meta<typeof CalendarPage>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={render:()=> <div style={{padding:20}}><CalendarPage/></div>};
