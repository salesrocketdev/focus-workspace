import { test, expect } from '@playwright/test';
test('capture V4 screen candidates and validate basic flows',async({page},info)=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Meu dia'})).toBeVisible();
 await page.screenshot({path:info.outputPath('dashboard.png'),fullPage:false,animations:'disabled',scale:'css'});
 await page.getByRole('button',{name:'Editar painel',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Editar painel'})).toBeVisible();
 await page.screenshot({path:info.outputPath('editor.png'),fullPage:false,animations:'disabled',scale:'css'});
 await page.getByRole('button',{name:'Remover Tarefas',exact:true}).click();
 await expect(page.locator('[data-widget=tasks]')).toHaveCount(0);
 await page.getByRole('button',{name:'Cancelar',exact:true}).click();
 await expect(page.locator('[data-widget=tasks]')).toHaveCount(1);
 await page.getByRole('button',{name:'Editar painel',exact:true}).click();
 await page.getByRole('button',{name:'Remover Tarefas',exact:true}).click();
 await page.getByRole('button',{name:'Salvar painel',exact:true}).click();
 await page.reload();
 await expect(page.locator('[data-widget=tasks]')).toHaveCount(0);
 await page.getByRole('button',{name:'Continuar leitura',exact:true}).click();
 await expect(page.getByRole('button',{name:'Atualizar progresso'})).toBeVisible();
 await page.screenshot({path:info.outputPath('focus.png'),fullPage:false,animations:'disabled',scale:'css'});
 await page.getByRole('button',{name:'Atualizar progresso'}).click();
 await page.getByRole('spinbutton').fill('90');
 await page.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(page.getByText('Pág. 90 de 432')).toBeVisible();
});
test('editor supports catalogue, size, ordering and layout isolation',async({page},info)=>{
 await page.goto('/');
 const mobile=info.project.name==='mobile';
 await page.getByRole('button',{name:'Editar painel',exact:true}).click();
 if(mobile){
   await page.getByRole('button',{name:'Adicionar',exact:true}).click();
 } 
 await page.getByRole('textbox',{name:'Buscar widgets'}).fill('Notas');
 await page.getByRole('button',{name:/Notas Anotações rápidas/}).click();
 if(mobile) await page.getByRole('button',{name:'Seus widgets',exact:true}).click();
 await expect(page.locator('[data-widget=notes]')).toHaveCount(1);
 if(!mobile) await page.getByRole('button',{name:'Opções de Notas',exact:true}).click();
 await page.getByRole('button',{name:'Mover acima Notas',exact:true}).click();
 if(mobile) await page.getByRole('button',{name:'1 × 1',exact:true}).click();
 else await page.locator('[data-widget=notes]').getByRole('button',{name:'P',exact:true}).click();
 await page.getByRole('button',{name:'Salvar painel',exact:true}).click();
 await expect(page.locator('[data-widget=notes]')).toHaveAttribute('data-size','small');
 await page.reload();
 await expect(page.locator('[data-widget=notes]')).toHaveCount(1);
 await page.setViewportSize(mobile?{width:1366,height:768}:{width:390,height:844});
 await expect(page.locator('[data-widget=notes]')).toHaveCount(0);
});
test('dashboard fits supported widths without page-level horizontal scrolling',async({page},info)=>{
 if(info.project.name!=='desktop')return;
 for(const width of [1920,1366,1024,768,390,360]){
   await page.setViewportSize({width,height:900});
   await page.goto('/');
   await expect(page.getByRole('heading',{name:'Meu dia'})).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBeTruthy();
   await page.screenshot({path:info.outputPath('dashboard-'+width+'.png'),animations:'disabled',scale:'css'});
 }
});

test('timer starts on dashboard and stays active when opening focus', async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Iniciar foco',exact:true}).click();
 await expect(page.getByRole('button',{name:'Pausar foco',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
 await expect(page.getByRole('button',{name:'Pausar',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Pausar',exact:true}).click();
 await page.getByRole('button',{name:'Voltar',exact:true}).click();
 await expect(page.getByRole('button',{name:'Iniciar foco',exact:true})).toBeVisible();
});

test('editor controls share dimensions and previews are inert',async({page},info)=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Editar painel',exact:true}).click();
 const mobile=info.project.name==='mobile';
 const controls=await page.locator('.editing .edit-icon-button:visible').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return [r.width,r.height]}));
 expect(controls.length).toBeGreaterThan(0);
 for(const [w,h] of controls){expect(w).toBe(mobile?32:28);expect(h).toBe(w)}
 const heights=await page.locator('.edit-header .edit-text-button').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));
 expect(heights).toEqual(Array(3).fill(mobile?40:36));
 if(!mobile){
  await expect(page.locator('.editing .preview-content[inert]')).toHaveCount(7);
  const rows=await page.locator('.catalogue-item').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));
  expect(new Set(rows).size).toBe(1);
  await page.getByRole('button',{name:'Opções de Foco (Pomodoro)',exact:true}).click();
  await expect(page.getByRole('group',{name:'Opções de Foco (Pomodoro)',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('group',{name:'Opções de Foco (Pomodoro)',exact:true})).toHaveCount(0);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 await page.screenshot({path:info.outputPath('editor-standardized.png'),animations:'disabled',scale:'css'});
});

test('workspace titles remain anchored across routes and editor',async({page},info)=>{
 const mobile=info.project.name==='mobile';
 await page.goto('/');
 const header=page.locator('.workspace-page-header h1');
 const origin=await header.boundingBox();
 expect(origin).not.toBeNull();
 async function check(title:string){
  await expect(header).toHaveText(title);
  const box=await header.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box!.x-origin!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(box!.y-origin!.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(box!.height-origin!.height)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  await page.screenshot({path:info.outputPath('route-'+title.replace(/\s+/g,'-')+'.png'),animations:'disabled',scale:'css'});
 }
 const nav=page.locator(mobile?'.bottom-nav':'.sidebar nav');
 await check('Meu dia');
 for(const [label,title] of [['Agenda','Agenda'],['Atividades','Atividades'],['Histórico','Histórico'],[mobile?'Ajustes':'Configurações','Configurações']]){
  await nav.getByRole('button',{name:label,exact:true}).click();
  await check(title);
 }
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await page.getByRole('button',{name:'Editar painel',exact:true}).click();
 await check('Editar painel');
 await page.getByRole('button',{name:'Cancelar',exact:true}).click();
 await check('Meu dia');
});
test('editor title stays aligned at tablet and compact widths',async({page},info)=>{
 if(info.project.name!=='desktop')return;
 for(const width of [1920,1366,1024,768,390,360]){
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  const title=page.locator('.workspace-page-header h1');
  const before=await title.boundingBox();
  await page.getByRole('button',{name:'Editar painel',exact:true}).click();
  const after=await title.boundingBox();
  expect(Math.abs(after!.x-before!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(after!.y-before!.y)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 }
});

test('provider artwork is local, legible and consistent across views',async({page},info)=>{
 await page.goto('/');
 const marks=page.locator('.provider-mark:visible');
 expect(await marks.count()).toBeGreaterThan(2);
 for(const provider of ['google-calendar','outlook','spotify']){
  const mark=page.locator('.provider-mark[data-provider="'+provider+'"]:visible').first();
  await expect(mark).toBeVisible();
  expect(await mark.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBeTruthy();
 }
 const nav=page.locator(info.project.name==='mobile'?'.bottom-nav':'.sidebar nav');
 await nav.getByRole('button',{name:'Agenda',exact:true}).click();
 await expect(page.locator('.agenda-list .provider-mark[data-provider="outlook"]')).toBeVisible();
 await nav.getByRole('button',{name:info.project.name==='mobile'?'Ajustes':'Configurações',exact:true}).click();
 const list=page.locator('.integration-preview-list');
 await expect(list.locator('.provider-mark')).toHaveCount(6);
 for(const img of await list.locator('img').all()){
  expect(await img.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0&&el.getBoundingClientRect().width===24&&el.getBoundingClientRect().height===24)).toBeTruthy();
 }
 await expect(page.getByText('Nenhum provedor conectado nesta prévia.')).toBeVisible();
 await page.screenshot({path:info.outputPath('provider-icons.png'),animations:'disabled',scale:'css'});
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await page.getByRole('button',{name:'Editar painel',exact:true}).click();
 if(info.project.name==='mobile')await page.getByRole('button',{name:'Adicionar',exact:true}).click();
 await expect(page.locator('.catalogue-item .provider-mark[data-provider="spotify"]')).toBeVisible();
 await page.screenshot({path:info.outputPath('provider-catalogue.png'),animations:'disabled',scale:'css'});
});

test('reading dialog uses shared controls and accessible modal behavior',async({page},info)=>{
 await page.goto('/');
 await page.evaluate(()=>document.fonts.ready);
 await page.getByRole('button',{name:'Continuar leitura',exact:true}).click();
 const opener=page.getByRole('button',{name:'Atualizar progresso',exact:true});
 await opener.click();
 const dialog=page.getByRole('dialog',{name:'Atualizar progresso'});
 await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('spinbutton',{name:'Página atual'})).toBeFocused();
 const heights=await dialog.locator('.dialog-actions .ui-button').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));
 expect(heights).toEqual(Array(2).fill(info.project.name==='mobile'?44:36));
 await dialog.getByRole('spinbutton').fill('433');
 await dialog.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(dialog).toBeVisible();
 await dialog.getByRole('spinbutton').fill('84');
 await page.screenshot({path:info.outputPath('reading-dialog.png'),animations:'disabled',scale:'css'});
 await page.keyboard.press('Escape');
 await expect(dialog).toHaveCount(0);
 await expect(opener).toBeFocused();
 await opener.click();
 await dialog.getByRole('spinbutton').fill('84');
 await dialog.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(dialog).toHaveCount(0);
 await expect(page.getByText('Pág. 84 de 432')).toBeVisible();
 await expect(page.getByRole('status')).toContainText('Progresso atualizado.');
});
test('local Inter font and settings field render consistently',async({page},info)=>{
 await page.goto('/');
 await page.evaluate(()=>document.fonts.ready);
 expect(await page.evaluate(()=>document.fonts.check('14px "Inter Variable"'))).toBeTruthy();
 const nav=page.locator(info.project.name==='mobile'?'.bottom-nav':'.sidebar nav');
 await nav.getByRole('button',{name:info.project.name==='mobile'?'Ajustes':'Configurações',exact:true}).click();
 const select=page.getByLabel('Duração do Pomodoro');
 await expect(select).toBeVisible();
 const size=await select.boundingBox();
 expect(size?.height).toBe(info.project.name==='mobile'?44:42);
 await select.selectOption('3000');
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await expect(page.getByRole('img',{name:'50:00 · Leitura'})).toBeVisible();
});
