import { expect, test } from '@playwright/test';
import { openNavigation } from '../navigate-test';
import { finishTask } from '../src/task-planning';

test('recurrence keeps its original date after a one-off reschedule', () => {
 const tasks = [{ id:1, categoryId:'work', title:'Relatório', done:false, repeat:'monthly' as const,
  plannedDate:'2027-02-26', dueDate:'2027-02-27', recurrenceDate:'2027-02-28', recurrenceDueDate:'2027-03-01', monthDay:31,
  checklist:[{title:'Enviar',done:true}] }];
 const result = finishTask(tasks,1,true);
 expect(result[0].done).toBe(true);
 expect(result[1]).toMatchObject({ id:2, previousOccurrence:1, plannedDate:'2027-03-31',
  dueDate:'2027-04-01', done:false, checklist:[{title:'Enviar',done:false}] });
 expect(finishTask(result,1,true)).toBe(result);
});

test('manual task management preserves source and preview without a dev capture button', async ({page}) => {
 await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')));
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 await openNavigation(nav,'Tarefas');
 await expect(page.getByRole('button',{name:'Capturar exemplo'})).toHaveCount(0);
 await page.getByRole('button',{name:'Nova tarefa',exact:true}).click();
 const dialog=page.getByRole('dialog');
 await dialog.getByLabel('Título da tarefa').fill('Responder à proposta de orçamento');
 await dialog.getByRole('button',{name:'Origem e link',exact:true}).click();
 await dialog.getByRole('combobox',{name:'Origem',exact:true}).click();
 await page.getByRole('option',{name:'Gmail',exact:true}).click();
 await dialog.getByRole('button',{name:'Adicionar tarefa',exact:true}).click();
 await page.getByRole('button',{name:'Ver e-mail'}).click();
 await expect(dialog).toContainText('Marina');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Nova tarefa',exact:true}).click();
 await dialog.getByLabel('Título da tarefa').fill('Alinhamento semanal do produto');
 await dialog.getByRole('button',{name:'Origem e link',exact:true}).click();
 await dialog.getByRole('combobox',{name:'Origem',exact:true}).click();
 await page.getByRole('option',{name:'Google Meet',exact:true}).click();
 await dialog.getByRole('button',{name:'Adicionar tarefa',exact:true}).click();
 await page.getByRole('button',{name:'Entrar no Google Meet'}).click();
 await expect(dialog).toContainText('Demonstração com dados fictícios.');
});

test('persists the habit check-in after reload', async ({page}) => {
 await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')));
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 await openNavigation(nav,'Hábitos');
 await page.getByRole('button',{name:'Novo hábito',exact:true}).click();
 await page.getByLabel('Nome do hábito').fill('Ler 10 páginas');
 await page.getByRole('button',{name:'Salvar hábito'}).click();
 await page.getByRole('checkbox',{name:/Ler 10 páginas em/}).last().check();
 await page.reload();
 await openNavigation(nav,'Hábitos');
 await expect(page.getByRole('checkbox',{name:/Ler 10 páginas em/}).last()).toBeChecked();
});

test('keeps planned dates, deadlines and completion history independently', async ({page}) => {
 await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')));
 await page.goto('/');
 await openNavigation(page.getByRole('navigation',{name:'Navegação principal'}),'Tarefas');
 await page.getByRole('button',{name:'Nova tarefa',exact:true}).click();
 const dialog=page.getByRole('dialog');
 await dialog.getByLabel('Título da tarefa').fill('Fechar apontamentos');
 await dialog.getByRole('button',{name:'Adicionar datas e detalhes'}).click();
 await dialog.getByLabel('Planejada para',{exact:true}).fill('2027-04-12');
 await dialog.getByLabel('Prazo',{exact:true}).fill('2027-04-14');
 await dialog.getByRole('combobox',{name:'Repetição',exact:true}).click();
 await page.getByRole('option',{name:'Semanalmente',exact:true}).click();
 await dialog.getByRole('button',{name:'Adicionar tarefa',exact:true}).click();
 await page.getByRole('checkbox',{name:'Concluir Fechar apontamentos',exact:true}).click();
 await expect(page.getByRole('checkbox',{name:'Concluir Fechar apontamentos',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Concluídas',exact:true}).click();
 await expect(page.getByRole('checkbox',{name:'Reabrir Fechar apontamentos',exact:true})).toBeChecked();
 const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('focus-workspace:v4:workspace')??'{}'));
 expect(snapshot.tasks.filter((task:{title:string})=>task.title==='Fechar apontamentos')).toMatchObject([
  { plannedDate:'2027-04-12',dueDate:'2027-04-14',done:true },
  { plannedDate:'2027-04-19',dueDate:'2027-04-21',done:false },
 ]);
});
