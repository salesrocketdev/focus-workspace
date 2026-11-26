import type { Meta,StoryObj } from '@storybook/react';
import { HistoryPage } from './history-page';
import { initialRecords } from './history-model';
const meta={title:'V4/Screens/History',component:HistoryPage,parameters:{layout:'fullscreen'}} satisfies Meta<typeof HistoryPage>;
export default meta;
export const Default:StoryObj<typeof meta>={args:{records:initialRecords,goal:240},render:args=><div style={{padding:20}}><HistoryPage {...args}/></div>};
