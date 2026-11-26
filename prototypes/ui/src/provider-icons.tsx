import { Mail, CalendarDays, Music2, Video, type LucideIcon } from 'lucide-react';
import googleCalendar from './assets/providers/google-calendar.svg';
import gmail from './assets/providers/gmail.svg';
import outlook from './assets/providers/outlook.svg';
import spotify from './assets/providers/spotify.svg';
import googleMeet from './assets/providers/google-meet.svg';
import teams from './assets/providers/teams.svg';

const providers = {
 'google-calendar': {label:'Google Agenda',src:googleCalendar,fallback:CalendarDays},
 gmail:{label:'Gmail',src:gmail,fallback:Mail},
 outlook:{label:'Microsoft Outlook',src:outlook,fallback:Mail},
 spotify:{label:'Spotify',src:spotify,fallback:Music2},
 'google-meet':{label:'Google Meet',src:googleMeet,fallback:Video},
 teams:{label:'Microsoft Teams',src:teams,fallback:Video},
} satisfies Record<string,{label:string;src:string;fallback:LucideIcon}>;

export type ProviderId=keyof typeof providers;
export const providerIds=Object.keys(providers) as ProviderId[];

// Brand marks are decorative when the adjacent label identifies the service.
// This remains a visual prototype, not an indication of an active connection.
export function ProviderIcon({provider,size=18,labelled=false}:{provider:ProviderId;size?:number;labelled?:boolean}){
 const entry=providers[provider];
 return <img className="provider-mark" data-provider={provider} src={entry.src} alt={labelled?entry.label:''} width={size} height={size} draggable={false}/>;
}
export function ProviderLabel({provider,size=18}:{provider:ProviderId;size?:number}){
 return <span className="provider-label"><ProviderIcon provider={provider} size={size}/><span>{providers[provider].label}</span></span>;
}
