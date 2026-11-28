import { test, expect, type Page } from '@playwright/test';
import { openNavigation } from '../navigate-test';

async function guest(page:Page){
 await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')));
 await page.goto('/');
}
async function openRhythms(page:Page){
 await page.getByRole('button',{name:'Configurar sessão de foco',exact:true}).click();
 await page.getByRole('button',{name:'Escolher ou criar ritmo de foco',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Ritmos de foco'})).toBeVisible();
}
test('V5 curated Home, theme and no page overflow',async({page},info)=>{
 await guest(page);
 await expect(page.getByRole('heading',{name:'Hoje',exact:true})).toBeVisible();
 await expect(page.locator('.workspace[data-route=today] .widget')).toHaveCount(5);
 await expect(page.locator('[data-widget=music]')).toHaveCount(0);
 await expect(page.getByRole('region',{name:'Espaço para foco na agenda de demonstração'})).toBeVisible();
 await expect(page.getByRole('progressbar',{name:'Meta diária de foco'})).toBeVisible();
 const nav=page.getByRole('navigation',{name:'Navegação principal'}).filter({visible:true});
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [theme,label] of [['light','Claro'],['dark','Escuro']] as const){
  await openNavigation(nav,'Configurações');
  await page.getByRole('navigation',{name:'Seções de configurações'}).getByRole('button',{name:'Aparência',exact:true}).click();
  await page.getByRole('button',{name:label,exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  await nav.getByRole('button',{name:'Hoje',exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  await page.screenshot({path:info.outputPath('v5-home-'+theme+'.png'),animations:'disabled',fullPage:true});
  await openNavigation(nav,'Histórico');
  const stats=page.locator('.history-stat');
  await expect(stats).toHaveCount(4);
  const surfaces=await stats.evaluateAll(nodes=>nodes.map(node=>({shadow:getComputedStyle(node).boxShadow,background:getComputedStyle(node).backgroundColor})));
  expect(surfaces.every(s=>s.shadow==='none'&&(s.background==='rgba(0, 0, 0, 0)'||s.background==='transparent'))).toBeTruthy();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  await page.screenshot({path:info.outputPath('v5-history-'+theme+'.png'),animations:'disabled',fullPage:true});
 }
});
test('V5 custom rhythm creates, edits, applies and persists with aligned fields',async({page})=>{
 await guest(page);
 await openRhythms(page);
 await page.getByRole('button',{name:'Criar ritmo personalizado'}).click();
 await page.getByLabel('Nome do ritmo').fill('Revisão técnica');
 await page.getByLabel('Foco',{exact:true}).fill('45');
 await page.getByLabel('Pausa curta',{exact:true}).fill('8');
 await page.getByLabel('Pausa longa',{exact:true}).fill('20');
 await page.getByLabel('Ciclos',{exact:true}).fill('3');
 const [a,b]=await Promise.all([page.getByLabel('Pausa longa',{exact:true}).boundingBox(),page.getByLabel('Ciclos',{exact:true}).boundingBox()]);
 expect(a&&b).toBeTruthy();
 expect(Math.abs(a!.y-b!.y)).toBeLessThanOrEqual(1);
 await page.getByRole('button',{name:'Salvar ritmo',exact:true}).click();
 await page.getByRole('button',{name:'Editar ritmo Revisão técnica'}).click();
 await page.getByLabel('Foco',{exact:true}).fill('40');
 await page.getByRole('button',{name:'Salvar ritmo',exact:true}).click();
 await page.getByRole('button',{name:/Revisão técnica.*40 min/}).click();
 await expect(page.locator('[data-widget=focus] .ring-copy strong')).toHaveText('40:00');
 await page.reload();
 await openRhythms(page);
 await expect(page.getByRole('button',{name:/Revisão técnica.*40 min/})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Excluir ritmo Revisão técnica'}).click();
 await expect(page.getByRole('button',{name:'Editar ritmo Revisão técnica'})).toHaveCount(0);
});
test('V5 focus keeps pause and stop available and secondary controls on demand',async({page})=>{
 await guest(page);
 await page.getByRole('button',{name:'Iniciar foco',exact:true}).click();
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
 await expect(page.locator('.active-focus-quiet')).toBeVisible();
 await expect(page.getByRole('button',{name:'Pausar',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Encerrar',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Controles',exact:true}).click();
 await expect(page.locator('.active-focus-quiet')).toHaveCount(0);
 await page.getByRole('button',{name:'Pausar',exact:true}).click();
 await expect(page.getByRole('button',{name:'Iniciar',exact:true})).toBeVisible();
});
test('V5 single task management surface and honest account onboarding',async({page})=>{
 await page.goto('/');
 const onboarding=page.getByRole('dialog',{name:'Começar no Focora'});
 await expect(onboarding.getByRole('button',{name:/Continuar com Google/})).toBeDisabled();
 await expect(onboarding.getByRole('button',{name:/Continuar com Microsoft/})).toBeDisabled();
 await onboarding.getByRole('button',{name:'Continuar sem conta',exact:true}).click();
 await page.getByRole('dialog',{name:'Seu primeiro ritmo de foco'}).getByRole('button',{name:'Começar',exact:true}).click();
 const nav=page.getByRole('navigation',{name:'Navegação principal'}).filter({visible:true});
 await openNavigation(nav,'Tarefas');
 await expect(page.getByRole('button',{name:'Nova tarefa',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Capturar exemplo'})).toHaveCount(0);
 await openNavigation(nav,'Biblioteca');
 await expect(page.getByRole('group',{name:'Seções da biblioteca'})).toBeVisible();
 await expect(page.getByRole('group',{name:'Seções da biblioteca'}).getByRole('button',{name:'Tarefas',exact:true})).toHaveCount(0);
});

test('V5 legacy demo identity opens as guest without resetting local data',async({page})=>{
 await page.addInitScript(()=>{
  if(!localStorage.getItem('focus-workspace:v4:onboarding'))localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('google-demo'));
 });
 await page.goto('/');
 await expect(page.getByRole('dialog',{name:'Começar no Focora'})).toHaveCount(0);
 const nav=page.getByRole('navigation',{name:'Navegação principal'}).filter({visible:true});
 await openNavigation(nav,'Tarefas');
 await page.getByRole('button',{name:'Nova tarefa',exact:true}).click();
 const task=page.getByRole('dialog',{name:'Nova tarefa',exact:true});
 await task.getByLabel('Título da tarefa').fill('Preservar dados locais');
 await task.getByRole('button',{name:'Adicionar tarefa',exact:true}).click();
 await page.reload();
 await openNavigation(nav,'Configurações');
 await page.getByRole('navigation',{name:'Seções de configurações'}).getByRole('button',{name:'Perfil e painel',exact:true}).click();
 await expect(page.getByText('Modo visitante · somente neste navegador.',{exact:true})).toBeVisible();
 const providers=page.getByRole('group',{name:'Opções de conta'});
 await expect(providers.getByRole('button',{name:/Continuar com Google/})).toBeDisabled();
 await expect(providers.getByRole('button',{name:/Continuar com Microsoft/})).toBeDisabled();
 await openNavigation(nav,'Tarefas');
 await expect(page.locator('.planning-row').filter({hasText:'Preservar dados locais'})).toBeVisible();
});

test('V5 sectioned focus and task dialogs preserve draft and natural height',async({page},info)=>{
 await guest(page);
 await page.getByRole('button',{name:'Configurar sessão de foco',exact:true}).click();
 const focus=page.getByRole('dialog',{name:'Configurar sessão de foco'});
 await expect(focus.getByRole('combobox')).toHaveCount(4);
 await expect(focus.getByRole('switch')).toHaveCount(0);
 const compact=await focus.boundingBox();
 const viewport=page.viewportSize()!;
 expect(compact!.height).toBeLessThan(viewport.height*.75);
 expect(await focus.locator('.dialog-scroll-body').evaluate(e=>e.scrollHeight<=e.clientHeight+2)).toBeTruthy();
 expect(compact!.width).toBeLessThanOrEqual(Math.min(viewport.width,480)+1);
 const fields=await focus.getByRole('combobox').evaluateAll(nodes=>nodes.map(e=>({y:e.getBoundingClientRect().y,h:e.getBoundingClientRect().height})));
 expect(Math.abs(fields[0].y-fields[1].y)).toBeLessThanOrEqual(1);
 expect(Math.abs(fields[2].y-fields[3].y)).toBeLessThanOrEqual(1);
 await page.screenshot({path:info.outputPath('compact-focus.png'),animations:'disabled'});
 await focus.getByRole('button',{name:'Preferências',exact:true}).click();
 await expect(focus.getByRole('switch')).toHaveCount(3);
 await expect(focus.getByRole('combobox',{name:'Duração do Pomodoro'})).toHaveCount(0);
 await focus.getByRole('button',{name:'Sessão',exact:true}).click();
 await expect(focus.getByRole('switch')).toHaveCount(0);
 await focus.getByRole('button',{name:'Concluir',exact:true}).click();
 const nav=page.getByRole('navigation',{name:'Navegação principal'}).filter({visible:true});
 await openNavigation(nav,'Tarefas');
 await page.getByRole('button',{name:'Nova tarefa',exact:true}).click();
 const task=page.getByRole('dialog',{name:'Nova tarefa'});
 await expect(task.getByRole('textbox')).toHaveCount(1);
 await expect(task.getByRole('combobox')).toHaveCount(1);
 const priority=task.getByRole('checkbox',{name:/Destacar no painel/});
 await expect(priority).toBeVisible();
 await expect(task.getByRole('navigation',{name:'Seções da tarefa'}).getByRole('button')).toHaveCount(4);
 const priorityBox=await priority.boundingBox();
 expect(priorityBox!.width).toBeGreaterThanOrEqual(18);
 expect(priorityBox!.height).toBeGreaterThanOrEqual(18);
 expect((await task.boundingBox())!.height).toBeLessThan(viewport.height*.85);
 await task.getByLabel('Título da tarefa').fill('Teste de modal compacto');
 if(await priority.isEnabled())await priority.check();
 await page.screenshot({path:info.outputPath('compact-task.png'),animations:'disabled'});
 await task.getByRole('button',{name:'Conteúdo',exact:true}).click();
 await task.getByLabel('Descrição',{exact:true}).fill('Descrição preservada');
 await task.getByRole('button',{name:'Origem',exact:true}).click();
 await expect(task.getByRole('textbox',{name:'Descrição',exact:true})).toHaveCount(0);
 await task.getByRole('button',{name:'Adicionar tarefa',exact:true}).click();
 await page.getByRole('button',{name:'Teste de modal compacto',exact:true}).click();
 const edit=page.getByRole('dialog',{name:'Detalhes da tarefa'});
 expect((await edit.boundingBox())!.height).toBeLessThan(viewport.height*.85);
 await edit.getByRole('button',{name:'Conteúdo',exact:true}).click();
 await expect(edit.getByLabel('Descrição',{exact:true})).toHaveValue('Descrição preservada');
 await edit.getByRole('button',{name:'Salvar',exact:true}).click();
});

test('V5 scene cards share geometry and immersive art remains prominent in focus',async({page},info)=>{
 await guest(page);
 await page.emulateMedia({reducedMotion:'reduce'});
 const nav=page.getByRole('navigation',{name:'Navegação principal'}).filter({visible:true});
 await openNavigation(nav,'Configurações');
 await page.getByRole('navigation',{name:'Seções de configurações'}).getByRole('button',{name:'Aparência',exact:true}).click();
 const options=page.getByRole('group',{name:'Cenário do modo foco'});
 await expect(options.getByRole('button')).toHaveCount(6);
 const dimensions=await options.getByRole('button').evaluateAll(nodes=>nodes.map(e=>{const r=e.getBoundingClientRect();const p=e.querySelector('.scene-sample')!.getBoundingClientRect();return {w:r.width,h:r.height,pw:p.width,ph:p.height}}));
 for(const key of ['w','h','pw','ph'] as const)expect(Math.max(...dimensions.map(d=>d[key]))-Math.min(...dimensions.map(d=>d[key])), 'scene geometry '+key+' '+JSON.stringify(dimensions)).toBeLessThanOrEqual(1);
 await options.getByRole('button',{name:'Aurora',exact:true}).click();
 await options.screenshot({path:info.outputPath('scene-cards.png'),animations:'disabled'});
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
 const landscape=page.locator('.focus-landscape');
 await expect(landscape).toHaveAttribute('data-focus-scene','aurora');
 const viewport=page.viewportSize()!;
 const rect=await landscape.boundingBox();
 expect(rect!.height).toBeGreaterThan(viewport.height*.28);
 expect(Math.abs(rect!.y+rect!.height-viewport.height)).toBeLessThanOrEqual(2);
 expect(await landscape.evaluate(e=>getComputedStyle(e).pointerEvents)).toBe('none');
 await expect(landscape.locator(viewport.width<760?'.scene-portrait-art':'.scene-wide-art')).toBeVisible();
 await page.screenshot({path:info.outputPath('scene-expanded.png'),animations:'disabled'});
 const transport=page.locator('.focus-center .transport');
 await transport.getByRole('button',{name:'Iniciar',exact:true}).click();
 await expect(transport.getByRole('button',{name:'Pausar',exact:true})).toBeVisible();
 await expect(landscape).toBeVisible();
 await page.screenshot({path:info.outputPath('scene-active.png'),animations:'disabled'});
 await transport.getByRole('button',{name:'Pausar',exact:true}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});

test('V5 real dates and touch targets remain correct in narrow layouts',async({page},info)=>{
 await page.clock.install({time:new Date('2026-11-27T12:00:00')});
 await guest(page);
 const nav=page.getByRole('navigation',{name:'Navegação principal'}).filter({visible:true});
 await expect(page.locator('[data-widget=goal]')).toContainText('0 min');
 if(info.project.name!=='desktop'){
  const b=await page.getByRole('button',{name:'Escolher atividade',exact:true}).boundingBox();
  expect(b!.height).toBeGreaterThanOrEqual(44);
 }
 await page.getByRole('button',{name:'Iniciar foco',exact:true}).click();
 await page.clock.fastForward(1500000+250);
 await expect(page.locator('[data-widget=goal]')).toContainText('25 min');
 const real=await page.evaluate(()=>JSON.parse(localStorage.getItem('focus-workspace:v4:workspace')!).records.filter((r:{origin:string})=>r.origin==='session'));
 expect(real).toHaveLength(1);
 expect(real[0].day).toBe('2026-11-27');
 await openNavigation(nav,'Histórico');
 await expect(page.getByRole('button',{name:'Minhas sessões'})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.history-stat').first()).toContainText('25 min');
 await page.getByRole('button',{name:'Exemplos',exact:true}).click();
 await expect(page.locator('.history-stat').first()).toContainText('10h 32min');
 await page.getByRole('button',{name:'Minhas sessões'}).click();
 if(info.project.name!=='desktop'){
  const sizes=await page.locator('.history-bar-column').evaluateAll(nodes=>nodes.map(e=>e.getBoundingClientRect().width));
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(43.9);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 await openNavigation(nav,'Tarefas');
 if(info.project.name!=='desktop'){
  for(const selector of ['.planning-title','.planning-actions .priority-action']){
   const sizes=await page.locator(selector).evaluateAll(nodes=>nodes.map(e=>e.getBoundingClientRect().height));
   expect(Math.min(...sizes)).toBeGreaterThanOrEqual(44);
  }
 }
});

test('V5 dashboard surfaces remain visually distinct in both themes',async({page},info)=>{
 await guest(page);
 await page.emulateMedia({reducedMotion:'reduce'});
 const nav=page.getByRole('navigation',{name:'Navegação principal'}).filter({visible:true});
 const workspace=page.locator('.workspace[data-route=today]');
 const cards=workspace.locator('.widget>.card');
 const placement=await workspace.locator('.widget').evaluateAll(nodes=>nodes.map(e=>({id:e.getAttribute('data-widget'),placement:e.getAttribute('data-placement')})));
 for(const [theme,label] of [['light','Claro'],['dark','Escuro']] as const){
  await openNavigation(nav,'Configurações');
  await page.getByRole('navigation',{name:'Seções de configurações'}).getByRole('button',{name:'Aparência',exact:true}).click();
  await page.getByRole('button',{name:label,exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  await nav.getByRole('button',{name:'Hoje',exact:true}).click();
  await expect(cards).toHaveCount(5);
  const surfaces=await cards.evaluateAll(nodes=>nodes.map(node=>{
   const c=getComputedStyle(node),canvas=getComputedStyle(node.closest('.app')!),head=getComputedStyle(node.querySelector('.card-head')!);
   const luminance=(s:string)=>{
    const rgb=s.match(/[\d.]+/g)?.slice(0,3).map(Number);
    if(!rgb||rgb.length!==3)throw new Error('Unexpected color '+s);
    return rgb.map(v=>{const n=v/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
   };
   const contrast=(a:string,b:string)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
   return {surface:contrast(c.backgroundColor,canvas.backgroundColor),edge:contrast(c.borderTopColor,c.backgroundColor),shadow:c.boxShadow,radius:parseFloat(c.borderTopLeftRadius),border:parseFloat(c.borderTopWidth),header:contrast(head.color,c.backgroundColor)};
  }));
  for(const s of surfaces){
   expect(s.surface).toBeGreaterThanOrEqual(1.12);
   expect(s.edge).toBeGreaterThanOrEqual(1.18);
   expect(s.header).toBeGreaterThanOrEqual(4.5);
   expect(s.border).toBe(1);
   expect(s.radius).toBeGreaterThanOrEqual(10);
   expect(s.shadow).not.toBe('none');
  }
  const grid=workspace.locator('.widget-grid');
  expect(await grid.evaluate(e=>parseFloat(getComputedStyle(e).gap))).toBeGreaterThanOrEqual(info.project.name==='desktop'?16:14);
  expect(await workspace.locator('.widget').evaluateAll(nodes=>nodes.map(e=>({id:e.getAttribute('data-widget'),placement:e.getAttribute('data-placement')})))).toEqual(placement);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  await page.screenshot({path:info.outputPath('dashboard-surfaces-'+theme+'.png'),animations:'disabled',fullPage:true});
 }
});
