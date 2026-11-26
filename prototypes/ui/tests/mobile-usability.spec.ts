import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')))});
test('mobile navigation and controls remain usable on narrow screens',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Mobile-specific assertions');
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 for(const width of [320,360,390,430]){
  await page.setViewportSize({width,height:844});
  for(const label of ['Hoje','Agenda','Atividades','Histórico','Ajustes']){
   await nav.getByRole('button',{name:label,exact:true}).click();
   await expect(nav.getByRole('button',{name:label,exact:true})).toHaveAttribute('aria-current','page');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
   expect(await page.evaluate(()=>window.scrollY)).toBeLessThanOrEqual(1);
  }
 }
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await page.getByRole('button',{name:'Editar painel',exact:true}).click();
 const controls=await page.locator('.mobile-widget-row .edit-icon-button').evaluateAll(nodes=>nodes.map(n=>[(n as HTMLElement).offsetWidth,(n as HTMLElement).offsetHeight]));
 expect(controls.length).toBeGreaterThan(0);
 expect(controls.every(([w,h])=>w>=44&&h>=44)).toBeTruthy();
 await expect(page.getByRole('button',{name:'Salvar painel',exact:true})).toBeVisible();
 await page.screenshot({path:info.outputPath('mobile-editor-touch.png'),animations:'disabled',scale:'css'});
 await page.getByRole('button',{name:'Cancelar',exact:true}).click();
 await page.getByRole('button',{name:'Abrir ações rápidas',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Ações rápidas'});
 await expect(dialog).toBeVisible();
 const font=await dialog.getByRole('searchbox').evaluate(el=>getComputedStyle(el).fontSize);
 expect(parseFloat(font)).toBeGreaterThanOrEqual(16);
 await page.screenshot({path:info.outputPath('mobile-command-sheet.png'),animations:'disabled',scale:'css'});
});
test('route transitions do not duplicate dashboard or editor widgets',async({page},info)=>{
 await page.goto('/');
 const nav=page.locator(info.project.name==='mobile'?'.bottom-nav':'.sidebar nav');
 for(let i=0;i<3;i++){
  await nav.getByRole('button',{name:'Agenda',exact:true}).click();
  await expect(page.locator('[data-widget=focus]')).toHaveCount(0);
  await nav.getByRole('button',{name:'Hoje',exact:true}).click();
  await expect(page.locator('[data-widget=focus]')).toHaveCount(1);
  await page.getByRole('button',{name:'Editar painel',exact:true}).click();
  await expect(page.locator('[data-widget=focus]')).toHaveCount(1);
  await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  await expect(page.locator('[data-widget=focus]')).toHaveCount(1);
 }
});
