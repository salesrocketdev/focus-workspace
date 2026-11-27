import { openNavigation } from '../navigate-test';
import {test,expect,type Page,type Locator} from '@playwright/test';
const sizes=[
 {width:320,height:568},{width:360,height:640},{width:375,height:667},
 {width:390,height:844},{width:414,height:896},{width:430,height:932},
 {width:540,height:720},{width:667,height:375},{width:844,height:390}
];
const mobileProject=(name:string)=>['mobile','mobile-narrow','iphone-webkit'].includes(name);
async function contained(child:Locator,parent:Locator,label:string){
 await expect(child).toBeVisible();
 const a=await child.boundingBox(),b=await parent.boundingBox();
 expect(a&&b,label+' boxes').toBeTruthy();if(!a||!b)return;
 expect(a.x,label+' left').toBeGreaterThanOrEqual(b.x-1);
 expect(a.x+a.width,label+' right').toBeLessThanOrEqual(b.x+b.width+1);
 expect(a.y,label+' top').toBeGreaterThanOrEqual(b.y-1);
 expect(a.y+a.height,label+' bottom').toBeLessThanOrEqual(b.y+b.height+1);
}
async function separate(a:Locator,b:Locator,label:string){
 const x=await a.boundingBox(),y=await b.boundingBox();
 expect(x&&y,label+' boxes').toBeTruthy();if(!x||!y)return;
 const iw=Math.min(x.x+x.width,y.x+y.width)-Math.max(x.x,y.x);
 const ih=Math.min(x.y+x.height,y.y+y.height)-Math.max(x.y,y.y);
 expect(iw<=1||ih<=1,label+' non-overlap').toBeTruthy();
}
async function fit(page:Page,label:string){
 const out=await page.evaluate(()=>{
  const visible=(e:Element)=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&!e.closest('[inert],[aria-hidden=true]')};
  const selectors=['.history-export-header','.activity-section-head','.category-focus-row','.book-row-actions','.history-session','.backup-row','.dialog-header','.dialog-actions','.focus-center .transport','.calendar-date-controls','.calendar-source-options','.calendar-source-button','.scene-options','.scene-copy'];
  return {page:document.documentElement.scrollWidth-innerWidth,internal:Array.from(document.querySelectorAll(selectors.join(','))).filter(visible).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>({class:e.className,width:e.clientWidth,scroll:e.scrollWidth,children:Array.from(e.children).filter(visible).map(child=>({class:child.getAttribute('class'),width:Math.round(child.getBoundingClientRect().width),right:Math.round(child.getBoundingClientRect().right-e.getBoundingClientRect().right)}))}))};
 });
 expect.soft(out.page,label+' horizontal page overflow').toBeLessThanOrEqual(1);
 expect.soft(out.internal,label+' internal overflow').toEqual([]);
}
async function dialogFits(page:Page,label:string){
 const dialog=page.getByRole('dialog');
 await expect(dialog).toBeVisible();
 const rect=await dialog.boundingBox(),viewport=page.viewportSize()!;
 expect(rect,label+' dialog box').toBeTruthy();if(!rect)return;
 expect(rect.x,label+' left').toBeGreaterThanOrEqual(-1);
 expect(rect.x+rect.width,label+' right').toBeLessThanOrEqual(viewport.width+1);
 expect(rect.y,label+' top').toBeGreaterThanOrEqual(-1);
 expect(rect.y+rect.height,label+' bottom').toBeLessThanOrEqual(viewport.height+1);
 await fit(page,label);
}
for(const size of sizes){
 test('mobile matrix '+size.width+'x'+size.height+': card alignment, filters, dialogs and focus',async({page},info)=>{
  test.skip(!mobileProject(info.project.name),'Mobile and mobile WebKit geometry');
  test.setTimeout(90000);
  const narrow=size.width<760;
  await page.setViewportSize(size);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')));
  await page.goto('./');
  await expect(page.getByRole('heading',{name:'Hoje',exact:true})).toBeVisible();
  const nav=page.getByRole('navigation',{name:'Navegação principal'});
  const go=async(label:string)=>openNavigation(nav,label);
  await fit(page,'dashboard');
  await page.getByRole('button',{name:'Editar painel',exact:true}).click();await fit(page,'editor');await page.getByRole('button',{name:'Layouts',exact:true}).click();await dialogFits(page,'layout presets');await page.getByRole('dialog',{name:'Layouts sugeridos'}).getByRole('button',{name:'Cancelar',exact:true}).click();await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  await page.getByRole('button',{name:'Adicionar tarefa rápida'}).click();await dialogFits(page,'quick task');await page.getByRole('button',{name:'Fechar diálogo'}).click();
  await go('Histórico');
  const header=page.locator('.history-export-header'),copy=header.locator('.history-export-copy'),csv=header.getByRole('button',{name:'CSV',exact:true});
  await contained(csv,header,'CSV header');
  await separate(copy,csv,'CSV vs title');
  const c=await csv.boundingBox(),h=await header.boundingBox(),t=await copy.boundingBox();
  expect(c&&h&&t).toBeTruthy();
  if(c&&h&&t){
   expect(Math.abs(c.x+c.width-(h.x+h.width)),'CSV right alignment').toBeLessThanOrEqual(2);
   expect(Math.abs(c.y+c.height/2-(t.y+t.height/2)),'CSV vertical center').toBeLessThanOrEqual(2);
   if(narrow)expect(c.height).toBeGreaterThanOrEqual(44);
  }
  await header.scrollIntoViewIfNeeded();
  await header.screenshot({path:info.outputPath('history-csv-header.png'),animations:'disabled'});
  for(const range of ['Hoje','7 dias','30 dias']){
   await page.getByRole('group',{name:'Período do histórico'}).getByRole('button',{name:range,exact:true}).click();
   await fit(page,'history '+range);await separate(copy,csv,'CSV '+range);
   // Assert actual child rectangles, not just page overflow. The old 12px
   // track clipped a 15px arrow without overflowing the document.
   for(const row of await page.locator('.history-session').all()){
    const arrow=row.locator('svg').last(),mark=row.locator('.history-session-mark');
    await contained(arrow,row,'session arrow '+range);
    await contained(mark,row,'session mark '+range);
    await separate(row.locator('.history-session-copy'),row.locator('.history-session-meta'),'session copy and duration '+range);
    await separate(row.locator('.history-session-meta'),arrow,'session duration and arrow '+range);
    if(await row.locator('.history-status').count())await separate(row.locator('.history-status'),arrow,'session status and arrow '+range);
   }
  }
  if(narrow){
   await page.getByRole('button',{name:'Abrir filtros do histórico'}).click();
   await dialogFits(page,'history filters');
   await page.getByRole('button',{name:'Fechar diálogo'}).click();
  }
  await page.locator('.history-session').first().click();
  await dialogFits(page,'session detail');
  await page.getByRole('button',{name:'Fechar diálogo'}).click();
  await go('Agenda');
  await page.getByRole('button',{name:'Planejar foco das 09:30 às 11:00'}).click();await dialogFits(page,'plan focus');await page.getByRole('button',{name:'Fechar diálogo'}).click();
  const source=page.getByRole('button',{name:'Microsoft Outlook',exact:true});await contained(source,page.locator('.calendar-source-options'),'calendar source');await source.click();await expect(source).toHaveAttribute('aria-pressed','false');await source.click();await expect(source).toHaveAttribute('aria-pressed','true');
  for(const view of ['Dia','Semana','Mês']){
   await page.getByRole('group',{name:'Visualização da agenda'}).getByRole('button',{name:view,exact:true}).click();
   await fit(page,'agenda '+view);
  }
  await go('Biblioteca');
  await fit(page,'categories');
  const categoryHeader=page.locator('.activity-section-head').first();
  await separate(categoryHeader.locator('div').first(),categoryHeader.getByRole('button',{name:'Nova categoria'}),'category heading');
  await categoryHeader.getByRole('button',{name:'Nova categoria'}).click();
  await dialogFits(page,'category form');
  await page.getByLabel('Nome da categoria').fill('Categoria de auditoria com nome longo');
  await page.getByRole('button',{name:'Salvar',exact:true}).click();
  await fit(page,'long category');
  await go('Tarefas');await fit(page,'tasks');await go('Biblioteca');
  await page.getByRole('button',{name:'Leituras',exact:true}).click();await fit(page,'library');
  const libraryHeader=page.locator('.activity-section-head').first();
  await separate(libraryHeader.locator('div').first(),libraryHeader.locator('.book-header-actions'),'library heading');
  await page.getByRole('button',{name:'Buscar livro',exact:true}).click();
  await dialogFits(page,'book search');
  await page.getByRole('button',{name:'Fechar diálogo'}).click();
  await go(narrow?'Ajustes':'Configurações');
  const settings=page.getByRole('navigation',{name:'Seções de configurações'});
  for(const section of ['Sessões de foco','Notificações','Integrações','Perfil e painel','Aparência']){
   await settings.getByRole('button',{name:section,exact:true}).click();
   await fit(page,section);
   if(section==='Aparência'){await page.getByRole('button',{name:'Escuro',exact:true}).click();await page.getByRole('button',{name:'Oceano',exact:true}).click();await fit(page,'scene options');}
   if(narrow)await page.getByRole('button',{name:'Voltar às configurações'}).click();
  }
  await go('Histórico');await fit(page,'dark history');
  await separate(copy,csv,'dark CSV');
  await header.scrollIntoViewIfNeeded();
  await header.screenshot({path:info.outputPath('history-csv-dark.png'),animations:'disabled'});
  await page.locator('.history-list').scrollIntoViewIfNeeded();
  await page.locator('.history-list').screenshot({path:info.outputPath('history-session-list.png'),animations:'disabled'});
  await go('Hoje');
  await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
  await fit(page,'focus');
  await page.getByRole('button',{name:'Modo Zen',exact:true}).click();await fit(page,'zen');await expect(page.locator('.focus-side')).toBeHidden();await page.getByRole('button',{name:'Modo Zen',exact:true}).click();
  await expect(page.locator('.focus-landscape')).toHaveAttribute('data-focus-scene','ocean');
  const transport=page.locator('.focus-center .transport'),start=transport.getByRole('button',{name:'Iniciar',exact:true});
  await contained(start,transport,'focus start');
  await start.scrollIntoViewIfNeeded();
  await start.click();await expect(transport.getByRole('button',{name:'Pausar',exact:true})).toBeVisible();
  await transport.getByRole('button',{name:'Pausar',exact:true}).click();
  await page.screenshot({path:info.outputPath('focus.png'),animations:'disabled',scale:'css'});
  await page.getByRole('button',{name:'Configurar sessão de foco',exact:true}).click();await dialogFits(page,'focus preferences');
  await page.getByRole('button',{name:'Fechar diálogo'}).click();
 });
}
