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
