import type {BookMetadata} from './activity-model';
// Fictional catalogue, not a response from Open Library or Google Books.
export interface CatalogueEdition extends BookMetadata {title:string;author:string;pages:number|null;chapterTitles:string[]}
export const mockEditions:CatalogueEdition[]=[
 {source:'mock',editionId:'demo-study-pt',title:'Aprender com intenção',author:'Marina Vale (demo)',isbn:'9780000000002',publisher:'Editora Exemplo',year:2025,language:'Português',pages:240,coverStyle:'forest',chapterTitles:['Preparar o ambiente','Escolher objetivos','Aprender em blocos','Revisar e praticar','Construir uma rotina']},
 {source:'mock',editionId:'demo-study-en',title:'Learning with intention',author:'Marina Vale (demo)',isbn:'9780000000019',publisher:'Example Press',year:2024,language:'Inglês',pages:216,coverStyle:'indigo',chapterTitles:['Prepare','Practice','Review']},
 {source:'mock',editionId:'demo-focus-pt',title:'O tempo de uma ideia',author:'Rafael Nunes (demo)',isbn:'9780000000026',publisher:'Editora Exemplo',year:2026,language:'Português',pages:null,coverStyle:'sand',chapterTitles:[]},
];
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
export function searchMockBooks(query:string){
 const q=normalize(query),isbn=q.replace(/[-\s]/g,'');
 if(!q)return mockEditions;
 return mockEditions.filter(b=>normalize(b.title+' '+b.author+' '+b.publisher+' '+b.language).includes(q)||b.isbn.includes(isbn));
}
