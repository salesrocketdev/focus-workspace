import {useRef,useState} from 'react';
import {Download,Upload,FileText,ShieldCheck,Info} from 'lucide-react';
import {Button,Dialog} from './ui';
import {downloadText,exportHistory,makeBackup,parseBackup,type Backup} from './backup-model';
import type {FocusRecord} from './history-model';

export function BackupPanel({canRestore,canWrite,records,onRestore}:{canRestore:boolean;canWrite:boolean;records:FocusRecord[];onRestore:(backup:Backup)=>void}){
 const file=useRef<HTMLInputElement>(null);
 const [pending,setPending]=useState<Backup|null>(null),[error,setError]=useState(''),[feedback,setFeedback]=useState('');
 const [confirmed,setConfirmed]=useState(false);
 function backup(){
  try{const data=makeBackup();downloadText('focora-backup-'+data.exportedAt.slice(0,10)+'.json',JSON.stringify(data,null,2),'application/json');setError('');setFeedback('Arquivo de backup preparado. Guarde-o em local seguro.')}
  catch(e){setError(e instanceof Error?e.message:'Não foi possível exportar.')}
 }
 async function select(f:File|undefined){
  if(!f)return;
  setError('');setFeedback('');setPending(null);setConfirmed(false);
  try{if(f.size>10_000_000)throw new Error('Arquivo muito grande (máximo de 10 MB).');setPending(parseBackup(await f.text()))}catch(e){setError(e instanceof Error?e.message:'Não foi possível ler o arquivo.')}
 }
 return <section className="settings-subgroup backup-settings"><h3>Dados e backup</h3><div className="backup-row"><div><b><Download size={16}/> Backup completo</b><small>Tarefas, categorias, livros, histórico, painel, notas e preferências.</small></div><Button variant="secondary" size="sm" onClick={backup}>Exportar JSON</Button></div><div className="backup-row"><div><b><FileText size={16}/> Histórico de foco</b><small>Todos os registros, incluindo os de demonstração.</small></div><Button variant="secondary" size="sm" onClick={()=>exportHistory(records)}>Exportar CSV</Button></div><div className="backup-row"><div><b><Upload size={16}/> Restaurar backup</b><small>{canRestore?'Substitui os dados locais pelo arquivo escolhido.':!canWrite?'Use a aba responsável pelo workspace.':'Encerre ou reinicie o foco para restaurar.'}</small></div><Button variant="secondary" size="sm" disabled={!canRestore} onClick={()=>file.current?.click()}>Importar JSON</Button><input ref={file} type="file" accept=".json,application/json" className="ui-sr-only" aria-label="Arquivo de backup" tabIndex={-1} disabled={!canRestore} onChange={e=>{const chosen=e.target.files?.[0];e.target.value='';void select(chosen)}}/></div><small className="backup-note"><ShieldCheck size={15}/> Nenhum dado é enviado à internet. O arquivo não é criptografado. Sessões não concluídas, permissões nativas e atalhos automáticos não são restaurados.</small>{error&&!pending&&<p role="alert" className="activity-error">{error}</p>}{feedback&&<small role="status">{feedback}</small>}
 {pending&&<Dialog title="Restaurar backup" description="Revise os dados antes de substituir seu workspace." onDismiss={()=>{setPending(null);setError('')}}><div className="backup-review"><small>Exportado em {new Date(pending.exportedAt).toLocaleString('pt-BR')}</small><div className="backup-counts">{[{label:'Categorias',value:pending.data.workspace.categories.length},{label:'Tarefas',value:pending.data.workspace.tasks.length},{label:'Livros',value:pending.data.workspace.books.length},{label:'Sessões',value:pending.data.workspace.records.length}].map(v=><div key={v.label}><strong>{v.value}</strong><small>{v.label}</small></div>)}</div><div className="settings-info"><Info size={17}/><span>Feche outras abas do Focora. Esta operação substitui os dados atuais, sem mesclar. Exporte um backup atual antes de continuar.</span></div><Button variant="secondary" onClick={backup}>Exportar backup atual</Button><label className="backup-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> Entendo que os dados atuais serão substituídos.</label>{error&&<p role="alert" className="activity-error">{error}</p>}<footer className="dialog-actions"><Button variant="secondary" onClick={()=>setPending(null)}>Cancelar</Button><Button disabled={!confirmed||!canRestore} onClick={()=>{try{onRestore(pending)}catch(e){setError(e instanceof Error?e.message:'Falha ao restaurar.')}}}>Restaurar dados</Button></footer></div></Dialog>}
 </section>
}
