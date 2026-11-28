import type { Meta,StoryObj } from '@storybook/react';
import { ProviderLabel,providerIds } from './provider-icons';
const meta={title:'V4/Foundations/Provider icons',component:ProviderLabel} satisfies Meta<typeof ProviderLabel>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Catalogue:Story={args:{provider:'google-calendar'},render:()=> <div style={{display:'grid',gap:18,padding:24,background:'#fffaf6'}}>{providerIds.map(provider=><ProviderLabel key={provider} provider={provider} size={24}/>)}</div>};
