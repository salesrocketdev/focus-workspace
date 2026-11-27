import { openNavigation } from '../navigate-test';
import { test,expect } from '@playwright/test';
// Existing route tests explicitly skip first-run onboarding.
test.beforeEach(async({page})=>{await page.addInitScript(()=>{if(!localStorage.getItem('focus-workspace:v4:onboarding'))localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest'))})});

test('activities share tasks, categories, books and timer context with dashboard',async({page},info)=>{
 await page.goto('/');
 const nav=page.locator(info.project.name==='mobile'?'.bottom-nav':'.sidebar nav');
 await openNavigation(nav,'Atividades');
 const hub=page.locator('.activities-page');
 await expect(hub.locator('.activity-category')).toHaveCount(4);
 await page.screenshot({path:info.outputPath('activities-overview.png'),animations:'disabled',scale:'css'});
 await hub.getByRole('button',{name:'Nova categoria',exact:true}).click();
 await page.getByLabel('Nome da categoria').fill('Inglês');
 await page.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(hub.locator('.activity-category')).toHaveCount(5);
 await hub.getByRole('button',{name:'Tarefas',exact:true}).click();
 await hub.getByRole('button',{name:'Nova tarefa',exact:true}).click();
 await page.getByLabel('Título da tarefa').fill('Praticar conversação');
 await page.getByRole('combobox',{name:'Categoria',exact:true}).click();
 await page.getByRole('option',{name:'Inglês',exact:true}).click();
 await page.getByRole('button',{name:'Salvar',exact:true}).click();
 const task=hub.locator('.activity-task-row').filter({hasText:'Praticar conversação'});
 await expect(task).toBeVisible();
 await hub.getByLabel('Buscar atividades').fill('conversação');
 await expect(hub.locator('.activity-task-row')).toHaveCount(1);
 await task.getByRole('button',{name:'Focar em Praticar conversação'}).click();
 await expect(page.locator('.focus-activity-panel h2')).toHaveText('Praticar conversação');
 await page.getByRole('button',{name:'Iniciar',exact:true}).click();
 await page.getByRole('button',{name:'Ver atividades',exact:true}).click();
 await page.getByRole('button',{name:'Iniciar foco em Trabalho',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('Encerre ou reinicie');
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await expect(page.locator('[data-widget=focus] .timer-ring')).toHaveAttribute('aria-label',/Inglês/);
 await page.getByRole('button',{name:'Abrir sessão de foco'}).click();
 await page.getByLabel('Marcar tarefa como concluída').check();
 await page.getByRole('button',{name:'Encerrar',exact:true}).click();
 await page.getByRole('button',{name:'Ver atividades',exact:true}).click();
 await expect(hub.locator('.activity-task-row').filter({hasText:'Praticar conversação'}).getByRole('checkbox')).toBeChecked();
 await hub.getByRole('button',{name:'Leituras',exact:true}).click();
 await hub.getByRole('button',{name:'Adicionar livro',exact:true}).click();
 await page.getByLabel('Título do livro').fill('Livro de teste');
 await page.getByLabel('Autor',{exact:true}).fill('Autor exemplo');
 await page.getByLabel('Total de páginas').fill('100');
 await page.getByRole('button',{name:'Salvar',exact:true}).click();
 const book=hub.locator('.activity-book').filter({hasText:'Livro de teste'});
 await book.getByRole('button',{name:'Iniciar leitura'}).click();
 await expect(page.locator('.book-panel h2')).toHaveText('Livro de teste');
 await page.getByRole('button',{name:'Atualizar progresso'}).click();
 await page.getByRole('spinbutton').fill('40');
 await page.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(page.locator('.book-panel')).toContainText('Pág. 40 de 100');
 await page.screenshot({path:info.outputPath('activities-reading-focus.png'),animations:'disabled',scale:'css'});
 await page.getByRole('button',{name:'Voltar',exact:true}).click();
 await expect(page.locator('[data-widget=reading]')).toContainText('Livro de teste');
 await expect(page.locator('[data-widget=reading]')).toContainText('40%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});

 test('mobile section tabs are compact, aligned and touch accessible',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Mobile layout');
 await page.goto('/');
 await openNavigation(page.locator('.bottom-nav'),'Atividades');
 const tabs=page.getByRole('group',{name:'Seções de atividades'});
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:844});
  const boxes=await tabs.getByRole('button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {y:r.y,h:r.height,w:r.width}}));
  expect(boxes).toHaveLength(3);expect(boxes.every(b=>b.h>=44&&b.h<=45&&b.w>=44)).toBeTruthy();
  expect(Math.max(...boxes.map(b=>b.y))-Math.min(...boxes.map(b=>b.y))).toBeLessThan(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 }
 for(const title of ['Tarefas','Leituras','Visão geral']){
  await tabs.getByRole('button',{name:title,exact:true}).click();
  await expect(tabs.getByRole('button',{name:title,exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(tabs.locator('button[aria-pressed=true]')).toHaveCount(1);
 }
 await page.screenshot({path:info.outputPath('mobile-minimal-activity-tabs.png'),animations:'disabled',scale:'css'});
});
