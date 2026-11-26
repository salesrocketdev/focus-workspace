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
