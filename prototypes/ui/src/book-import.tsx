import {useState} from 'react';
import {BookOpen,Check,ChevronRight,Search,ArrowLeft,Plus,Info} from 'lucide-react';
import {Button,Dialog,Field,SearchField} from './ui';
import {Cover,Progress} from './components';
import {searchMockBooks,type CatalogueEdition} from './book-catalogue';
import {progressOf,type Book,type BookChapter} from './activity-model';
export function BookImport({books,onImport,onManual,onDismiss}:{books:Book[];onImport:(book:Book)=>void;onManual:()=>void;onDismiss:()=>void}){
 const [query,setQuery]=useState(''),[submitted,setSubmitted]=useState('');
 const [selected,setSelected]=useState<CatalogueEdition|null>(null);
 const [title,setTitle]=useState(''),[author,setAuthor]=useState(''),[pages,setPages]=useState(''),[error,setError]=useState('');
 const [chapters,setChapters]=useState(true);
 const results=searchMockBooks(submitted);
 const duplicate=(edition:CatalogueEdition)=>books.some(b=>b.metadata?.editionId===edition.editionId||b.metadata?.isbn===edition.isbn);
 function choose(e:CatalogueEdition){setSelected(e);setTitle(e.title);setAuthor(e.author);setPages(e.pages===null?'':String(e.pages));setChapters(true);setError('')}
 function save(){if(!selected||duplicate(selected))return;
  const total=Number(pages);
  if(!title.trim()||!author.trim()||!Number.isInteger(total)||total<1||total>10000){setError('Informe título, autor e um total válido de páginas.');return}
  const {title:_,author:__,pages:___,chapterTitles,...metadata}=selected;
  onImport({id:'book-'+crypto.randomUUID(),title:title.trim(),author:author.trim(),pages:total,page:0,metadata,chapters:chapters?chapterTitles.map((title,i)=>({id:'chapter-'+i,title,done:false})):[]});
 }
 return <Dialog title="Buscar livro" description="Catálogo de demonstração · nenhuma consulta externa." onDismiss={onDismiss}>
 {selected?<form className="book-import" onSubmit={e=>{e.preventDefault();save()}}>
 <button className="book-import-back" type="button" onClick={()=>{setSelected(null);setError('')}}><ArrowLeft size={16}/> Voltar aos resultados</button>
 <div className="book-import-edition"><Cover title={selected.title} coverStyle={selected.coverStyle}/><div><b>{selected.title}</b><small>{selected.author}</small><small>{selected.publisher} · {selected.year} · {selected.language}</small><small>ISBN de exemplo: {selected.isbn}</small></div></div>
 <Field label="Título do livro" value={title} required onChange={e=>setTitle(e.target.value)} maxLength={160}/>
 <Field label="Autor" value={author} required onChange={e=>setAuthor(e.target.value)} maxLength={160}/>
 <Field label="Total de páginas" type="number" required min="1" max="10000" step="1" value={pages} onChange={e=>setPages(e.target.value)} hint={selected.pages===null?'A edição não informa a quantidade de páginas. Preencha manualmente.':'Confirme a quantidade da sua edição.'}/>
 {selected.chapterTitles.length?<section className="book-import-index"><label><input type="checkbox" checked={chapters} onChange={e=>setChapters(e.target.checked)}/> Importar sumário de demonstração</label><ol>{selected.chapterTitles.map(c=><li key={c}>{c}</li>)}</ol></section>:<div className="settings-info"><Info size={16}/><span>Sumário indisponível. Você pode cadastrar capítulos depois.</span></div>}
 {error&&<p role="alert" className="activity-error">{error}</p>}
 <footer className="dialog-actions"><Button variant="secondary" onClick={onDismiss}>Cancelar</Button><Button type="submit" disabled={duplicate(selected)}>Importar livro</Button></footer>
 </form>:<div className="book-import"><form className="book-search-form" onSubmit={e=>{e.preventDefault();setSubmitted(query)}}><SearchField label="Título, autor ou ISBN" placeholder="Ex.: aprender, Marina, 978..." value={query} onValueChange={v=>{setQuery(v);if(!v)setSubmitted('')}}/><Button type="submit"><Search size={16}/> Buscar</Button></form>
 <div className="book-import-results"><small>{submitted?results.length+' edição(ões) encontrada(s)':'Sugestões para experimentar'} · dados fictícios</small>
 {results.length?results.map(e=><button key={e.editionId} type="button" className="book-import-result" disabled={duplicate(e)} aria-label={'Selecionar '+e.title+' — '+e.language} onClick={()=>choose(e)}><Cover title={e.title} coverStyle={e.coverStyle}/><span><b>{e.title}</b><small>{e.author}</small><small>{e.language} · {e.year} · {e.pages===null?'Páginas não informadas':e.pages+' pág.'}</small>{duplicate(e)&&<small className="book-import-added"><Check size={13}/> Já está na biblioteca</small>}</span><ChevronRight size={17}/></button>):<div className="activity-empty"><BookOpen size={28}/><b>Nenhum livro encontrado</b><small>Tente outro termo ou cadastre manualmente.</small></div>}</div>
 <footer className="dialog-actions"><Button variant="secondary" onClick={onManual}><Plus size={15}/> Cadastrar manualmente</Button></footer></div>}
 </Dialog>;
}
export function BookDetails({book,onChange,onDismiss}:{book:Book;onChange:(book:Book)=>void;onDismiss:()=>void}){
 const [chapter,setChapter]=useState('');
 const chapters=book.chapters??[],done=chapters.filter(c=>c.done).length;
 function update(next:BookChapter[]){onChange({...book,chapters:next})}
 return <Dialog title="Detalhes do livro" description="Acompanhe suas páginas e capítulos separadamente." onDismiss={onDismiss}><div className="book-import">
 <div className="book-import-edition"><Cover title={book.title} coverStyle={book.metadata?.coverStyle}/><div><b>{book.title}</b><small>{book.author}</small>{book.metadata&&<small>{book.metadata.publisher} · {book.metadata.year} · {book.metadata.language}</small>}<Progress value={progressOf(book)}/><small>Pág. {book.page} de {book.pages} · {progressOf(book)}%</small></div></div>
 {book.metadata&&<small>Metadados fictícios · ISBN de exemplo: {book.metadata.isbn}</small>}
 <section className="book-chapters"><header><h3>Plano de leitura</h3><small>{done} de {chapters.length} capítulos concluídos</small></header><Progress value={chapters.length?Math.round(done/chapters.length*100):0}/>{chapters.length?chapters.map(c=><label key={c.id} className={c.done?'chapter-done':''}><input type="checkbox" checked={c.done} onChange={e=>update(chapters.map(x=>x.id===c.id?{...x,done:e.target.checked}:x))}/><span>{c.title}</span></label>):<small>Nenhum capítulo cadastrado. Adicione os seus abaixo.</small>}
 <form className="book-chapter-form" onSubmit={e=>{e.preventDefault();if(!chapter.trim())return;update([...chapters,{id:crypto.randomUUID(),title:chapter.trim(),done:false}]);setChapter('')}}><Field label="Novo capítulo" placeholder="Nome do capítulo" value={chapter} maxLength={120} onChange={e=>setChapter(e.target.value)}/><Button type="submit" disabled={!chapter.trim()}><Plus size={16}/> Adicionar</Button></form></section>
 <footer className="dialog-actions"><Button onClick={onDismiss}>Concluir</Button></footer>
 </div></Dialog>;
}
