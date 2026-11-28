import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>{if(!localStorage.getItem('focus-workspace:v4:onboarding'))localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest'))})});
test('editor presets, undo redo and per-widget preferences are transactional',async({page},info)=>{
 await page.goto('/');
 const mobile=info.project.name==='mobile', target=mobile?'mobile':'desktop';
 const edit=page.getByRole('button',{name:'Editar painel',exact:true}),save=page.getByRole('button',{name:'Salvar painel',exact:true}),undo=page.getByRole('button',{name:'Desfazer alteração do painel'}),redo=page.getByRole('button',{name:'Refazer alteração do painel'});
 await edit.click();await expect(page.getByText('Layout '+target,{exact:true})).toBeVisible();await expect(undo).toBeDisabled();
 await page.getByRole('button',{name:'Layouts',exact:true}).click();await page.getByRole('button',{name:'Aplicar Essencial',exact:true}).click();
 await expect(page.locator('[data-widget=reading]')).toHaveCount(0);await undo.click();await expect(page.locator('[data-widget=reading]')).toHaveCount(1);await redo.click();await expect(page.locator('[data-widget=reading]')).toHaveCount(0);
 const tasks=page.locator('[data-widget=tasks]');
 if(mobile){await tasks.locator('.mobile-widget-name').click();await page.getByRole('button',{name:'Configurar widget',exact:true}).click()}else{await tasks.getByRole('button',{name:'Opções de Tarefas'}).click();await tasks.getByRole('button',{name:'Configurar widget',exact:true}).click()}
 const dialog=page.getByRole('dialog',{name:'Configurar widget · Tarefas'});
 await dialog.getByRole('combobox',{name:'Quantidade de itens'}).click();await page.getByRole('option',{name:'1 item',exact:true}).click();await dialog.getByRole('button',{name:'Concluir',exact:true}).click();
 await save.click();await expect(tasks.locator('.dashboard-task-row')).toHaveCount(1);
 await page.reload();await expect(tasks.locator('.dashboard-task-row')).toHaveCount(1);await expect(page.locator('[data-widget=reading]')).toHaveCount(0);
 await edit.click();await page.getByRole('button',{name:'Layouts',exact:true}).click();await page.getByRole('button',{name:'Aplicar Completo',exact:true}).click();await page.getByRole('button',{name:'Cancelar',exact:true}).click();
 await expect(page.locator('[data-widget=reading]')).toHaveCount(0);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('focus-workspace:v4:layouts')!));
 expect(stored[target].find((w:{type:string})=>w.type==='tasks').options.rows).toBe(1);
 expect(stored[mobile?'desktop':'mobile'].some((w:{type:string})=>w.type==='reading')).toBeTruthy();
});
