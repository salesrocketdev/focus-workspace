import { openNavigation } from '../navigate-test';
import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')))});
test('keyboard skip link, active navigation and progress names',async({page},info)=>{
 await page.goto('/');
 await page.keyboard.press('Tab');
 await expect(page.getByRole('link',{name:'Ir para o conteúdo'})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.getByRole('main')).toBeFocused();
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 await expect(nav.getByRole('button',{name:'Hoje',exact:true})).toHaveAttribute('aria-current','page');
 await expect(page.getByRole('heading',{name:'Leitura em andamento',exact:true})).toBeVisible();
 await expect(page.getByRole('progressbar',{name:'Progresso de leitura: Clean Architecture'})).toBeVisible();
 await openNavigation(nav,'Biblioteca');
 await expect(nav.getByRole('button',{name:info.project.name==='mobile'?'Mais':'Biblioteca',exact:true})).toHaveAttribute('aria-current','page');
 await page.getByRole('button',{name:'Nova categoria',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Nova categoria'});
 await expect(dialog).toBeVisible();await page.keyboard.press('Escape');
 await expect(dialog).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Nova categoria',exact:true})).toBeFocused();
});
test('mobile settings and routes stay inside viewport in both themes',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Mobile geometry');
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:844});
  for(const label of ['Hoje','Agenda','Biblioteca','Histórico','Ajustes']){
   await openNavigation(nav,label);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  }
  const sections=page.getByRole('navigation',{name:'Seções de configurações'});
  for(const label of ['Sessões de foco','Notificações','Aparência','Integrações','Perfil e painel']){
   await sections.getByRole('button',{name:label,exact:true}).click();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
   if(label==='Aparência')await page.getByRole('button',{name:width===390?'Escuro':'Claro',exact:true}).click();
   await page.getByRole('button',{name:'Voltar às configurações'}).click();
  }
 }
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await page.screenshot({path:info.outputPath('audit-dashboard.png'),animations:'disabled',scale:'css'});
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
 await expect(nav).toHaveCount(0);
 await page.screenshot({path:info.outputPath('audit-immersive.png'),animations:'disabled',scale:'css'});
});
