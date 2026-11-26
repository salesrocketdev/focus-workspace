import {useEffect,useState} from 'react';
import {Moon,ExternalLink,Info,Clock} from 'lucide-react';
import {Button,Dialog,SelectField,ToggleCard} from './ui';
import {readStorage,writeStorage} from './preferences-model';
const KEY='focus-workspace:v4:distraction-shield';
export const SHORTCUT_NAME='Focora - Silenciar';
export function shortcutUrl(minutes:number){return 'shortcuts://run-shortcut?name='+encodeURIComponent(SHORTCUT_NAME)+'&input=text&text='+encodeURIComponent(String(minutes))}
export function useDistractionShield(){
 const [remind,setRemind]=useState(()=>readStorage(KEY)===true);
 useEffect(()=>{writeStorage(KEY,remind)},[remind]);
 return {remind,setRemind};
}
export type ShieldPreferences=ReturnType<typeof useDistractionShield>;
const appleMobile=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
export function DistractionSettings({shield,onOpen}:{shield:ShieldPreferences;onOpen:()=>void}){
 return <div className="settings-subgroup distraction-settings"><h3>Reduzir distrações</h3><ToggleCard title="Lembrar do Não Perturbe" description="Mostra um lembrete ao iniciar um novo período de foco. Não altera as configurações do dispositivo." icon={<Moon size={19}/>} checked={shield.remind} onChange={shield.setRemind}/><Button variant="secondary" onClick={onOpen}><Moon size={16}/> Configurar Não Perturbe</Button><small>Use o modo Foco do sistema para silenciar outros aplicativos. Os avisos do Focora dependem das permissões e exceções que você definir no dispositivo.</small></div>
}
export function DistractionDialog({suggestedMinutes,onDismiss}:{suggestedMinutes:number;onDismiss:()=>void}){
 const [minutes,setMinutes]=useState(Math.max(1,Math.min(120,Math.ceil(suggestedMinutes))));
 const [showSetup,setShowSetup]=useState(false);
 const ios=appleMobile();
 const options=[...new Set([5,15,25,30,50,60,90,120,minutes])].sort((a,b)=>a-b);
 return <Dialog title="Não Perturbe" description="Proteja seu tempo de concentração usando o modo nativo do dispositivo." onDismiss={onDismiss}>
 <div className="shield-content"><div className="shield-intro"><span><Moon size={25}/></span><div><b>Menos interrupções</b><small>O Focora não tem permissão para ligar, desligar ou verificar o Não Perturbe diretamente.</small></div></div>
 <section className="shield-method"><h3>Ativar pelo sistema</h3><p>{ios?'Abra a Central de Controle do iPhone, toque em Foco e escolha Não Perturbe ou um Foco personalizado.':'Abra os controles rápidos ou as configurações do dispositivo e ative Não Perturbe ou um modo de foco.'}</p><small>Configure exceções para contatos importantes e, se desejar, permita os avisos de fim de sessão do Focora.</small>{ios&&<a href="https://support.apple.com/pt-br/105112" target="_blank" rel="noreferrer">Instruções da Apple <ExternalLink size={13}/></a>}</section>
 {ios&&<section className="shield-method"><h3>Usar um Atalho do iPhone</h3><p>Se você já configurou o atalho abaixo, pode acioná-lo manualmente para silenciar as notificações por um tempo definido.</p><SelectField label="Duração do silêncio" value={minutes} onValueChange={v=>setMinutes(Number(v))} options={options.map(n=>({value:String(n),label:n+' min'}))}/><a className="ui-button ui-primary ui-md shield-shortcut" href={shortcutUrl(minutes)}><Clock size={16}/> Executar atalho ({minutes} min)</a><Button variant="secondary" aria-expanded={showSetup} onClick={()=>setShowSetup(v=>!v)}>{showSetup?'Ocultar instruções':'Como criar o atalho'}</Button>{showSetup&&<div className="shield-setup"><ol><li>No app Atalhos, crie um atalho com o nome exato <b>{SHORTCUT_NAME}</b>.</li><li>Receba a entrada de texto do atalho e converta-a em número de minutos.</li><li>Obtenha a data atual e ajuste-a adicionando esse número de minutos.</li><li>Use a ação Definir Foco para ativar Não Perturbe até a data ajustada. Teste o atalho manualmente antes de usar aqui.</li></ol><small>O link abre um atalho que você criou; não instala nem altera atalhos automaticamente. O sistema pode pedir confirmação.</small></div>}</section>}
 <div className="settings-info"><Info size={17}/><span>O estado do modo nativo não é verificável pelo PWA. O silêncio tem a duração definida no dispositivo ou atalho, não acompanha automaticamente pausas e encerramentos. Para terminar antes, desative-o na Central de Controle.</span></div>
 <footer className="dialog-actions"><Button onClick={onDismiss}>Voltar ao Focora</Button></footer></div></Dialog>
}
