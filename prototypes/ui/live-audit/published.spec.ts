import {test,expect,type Page} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
type Finding={screen:string;overflow:number;unnamedButtons:number;smallTargets:{name:string;w:number;h:number}[];clippedText:{text:string;w:number;scroll:number}[]};
test('published screens, navigation, controls and visual evidence',async({page},info)=>{
 const findings:Finding[]=[],errors:string[]=[],failedRequests:string[]=[];
 const mobile=info.project.name==='mobile-narrow'||info.project.name==='iphone-webkit';
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith('https://salesrocketdev.github.io/focus-workspace/')&&r.status()>=400)failedRequests.push(r.status()+' '+r.url())});
 await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')));
 const response=await page.goto('./');
 expect(response?.ok()).toBeTruthy();
 await expect(page.getByRole('heading',{name:'Meu dia'})).toBeVisible();
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 const go=async(name:string)=>{await nav.getByRole('button',{name,exact:true}).click()};
 async function audit(screen:string){
  await page.evaluate(()=>document.fonts.ready);
  const metrics=await page.evaluate(()=>{
   const visible=(e:Element)=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[inert],[aria-hidden="true"]')};
   const buttons=Array.from(document.querySelectorAll('button')).filter(e=>visible(e)&&!e.disabled);
   const name=(e:HTMLElement)=>e.getAttribute('aria-label')||e.innerText.trim()||e.getAttribute('title')||e.id||e.className;
   const smallTargets=buttons.map(e=>{const r=e.getBoundingClientRect();return {name:String(name(e)).slice(0,90),w:Math.round(r.width),h:Math.round(r.height)}}).filter(r=>r.w<44||r.h<44).slice(0,40);
   const clippedText=Array.from(document.querySelectorAll('h1,h2,h3,.category-row-copy b,.activity-book-copy>b,.ui-select-trigger')).filter(e=>visible(e)&&e.scrollWidth>e.clientWidth+2).map(e=>({text:(e.textContent||'').slice(0,90),w:e.clientWidth,scroll:e.scrollWidth})).slice(0,30);
   return {overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),smallTargets,clippedText};
  });
  const unnamedButtons=await page.getByRole('button',{name:'',exact:true}).count();
  const result={screen,...metrics,unnamedButtons,smallTargets:mobile?metrics.smallTargets:[]};
  findings.push(result);
  console.log('AUDIT '+info.project.name+' '+JSON.stringify(result));
  await page.screenshot({path:info.outputPath(screen+'.png'),fullPage:true,animations:'disabled',scale:'css'});
  expect.soft(result.overflow,screen+' page overflow').toBeLessThanOrEqual(1);
  expect.soft(result.unnamedButtons,screen+' unnamed buttons').toBe(0);
 }
 try{
  await audit('01-dashboard');
  if(mobile){
   const targets=page.locator('.quick-action-button:visible,[data-widget=music] .player-controls button:visible,[data-widget=focus] .timer-start:visible');
   const rects=await targets.evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return [r.width,r.height]}));
   expect.soft(rects.every(([w,h])=>w>=44&&h>=44),'dashboard controls have 44px targets').toBeTruthy();
   await expect(page.locator('[data-widget=focus] .timer-start span')).toBeVisible();
  }
  await page.getByRole('button',{name:'Editar painel',exact:true}).click();await audit('02-editor');await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  await go('Agenda');await audit('03-agenda');
  await go('Atividades');await audit('04-categories');
  await page.getByRole('button',{name:'Tarefas',exact:true}).click();await audit('05-tasks');
  await page.getByRole('button',{name:'Leituras',exact:true}).click();await audit('06-library');
  await go('Histórico');await audit('07-history');
  await page.getByRole('button',{name:'Linha',exact:true}).click();await audit('08-history-line');
  if(mobile){await page.getByRole('button',{name:'Abrir filtros do histórico'}).click();await audit('09-history-filters');await page.getByRole('button',{name:'Fechar diálogo'}).click()}
  await go(mobile?'Ajustes':'Configurações');await audit('10-settings');
  const sections=page.getByRole('navigation',{name:'Seções de configurações'});
  const settings=['Sessões de foco','Notificações','Integrações','Perfil e painel','Aparência'];
  for(const [i,label] of settings.entries()){
   await sections.getByRole('button',{name:label,exact:true}).click();await audit('11-settings-'+i);
   if(label==='Aparência'){await page.getByRole('button',{name:'Escuro',exact:true}).click();await page.getByRole('button',{name:'Aurora',exact:true}).click();await audit('12-dark-settings')}
   if(mobile)await page.getByRole('button',{name:'Voltar às configurações'}).click();
  }
  await go('Hoje');await audit('13-dark-dashboard');
  await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();await audit('14-focus');
  const transport=page.locator('.focus-center .transport');
  await transport.getByRole('button',{name:'Iniciar',exact:true}).click();
  await expect(transport.getByRole('button',{name:'Pausar',exact:true})).toBeVisible();
  await transport.getByRole('button',{name:'Pausar',exact:true}).click();
  await transport.getByRole('button',{name:'Reiniciar',exact:true}).click();
  if(mobile){
   const sizes=await transport.getByRole('button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return [r.width,r.height]}));
   expect.soft(sizes.every(([w,h])=>w>=44&&h>=44),'focus transport hit areas').toBeTruthy();
  }
  await audit('15-focus-reset');
 }finally{
  const report={url:page.url(),project:info.project.name,findings,errors,failedRequests};
  await writeFile(info.outputPath('audit.json'),JSON.stringify(report,null,2));
  console.log('AUDIT_SUMMARY '+JSON.stringify({project:info.project.name,screens:findings.length,errors,failedRequests,overflow:findings.filter(x=>x.overflow>1).map(x=>x.screen),unnamed:findings.filter(x=>x.unnamedButtons).map(x=>({screen:x.screen,count:x.unnamedButtons})),smallTargets:findings.reduce((n,x)=>n+x.smallTargets.length,0),clippedText:findings.reduce((n,x)=>n+x.clippedText.length,0)}));
  expect.soft(errors,'uncaught JavaScript errors').toEqual([]);
  expect.soft(failedRequests,'same-origin HTTP failures').toEqual([]);
 }
});
