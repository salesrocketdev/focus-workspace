import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')))});
test('optional native focus guide and reminder do not control the OS or stop timer',async({page},info)=>{
 await page.goto('/');
 const nav=page.locator(info.project.name==='mobile'?'.bottom-nav':'.sidebar nav');
 await nav.getByRole('button',{name:info.project.name==='mobile'?'Ajustes':'Configurações',exact:true}).click();
 await page.getByRole('navigation',{name:'Seções de configurações'}).getByRole('button',{name:'Notificações',exact:true}).click();
 const reminder=page.getByRole('switch',{name:'Lembrar do Não Perturbe'});
 await expect(reminder).toHaveAttribute('aria-checked','false');
 await page.getByRole('button',{name:'Configurar Não Perturbe',exact:true}).click();
 const sheet=page.getByRole('dialog',{name:'Não Perturbe'});
 await expect(sheet).toContainText('não tem permissão');
 await sheet.getByRole('button',{name:'Voltar ao Focora'}).click();
 await reminder.click();
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await page.reload();
 await page.getByRole('button',{name:'Iniciar foco',exact:true}).click();
 await expect(sheet).toBeVisible();
 await sheet.getByRole('button',{name:'Voltar ao Focora'}).click();
 await expect(page.getByRole('button',{name:'Pausar foco',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Pausar foco',exact:true}).click();
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
 await page.getByRole('button',{name:'Não Perturbe',exact:true}).click();
 await expect(sheet).toBeVisible();
 await page.screenshot({path:info.outputPath('distraction-shield.png'),animations:'disabled'});
 await sheet.getByRole('button',{name:'Voltar ao Focora'}).click();
 if(info.project.name==='mobile'){
  for(const width of [320,390,430]){
   await page.setViewportSize({width,height:844});
   const timer=await page.locator('.focus-center').boundingBox(),book=await page.locator('.book-panel').boundingBox();
   expect(timer!.y).toBeLessThan(book!.y);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
   expect(await page.locator('.immersive-actions button').evaluateAll(nodes=>nodes.every(el=>el.getBoundingClientRect().height>=44))).toBeTruthy();
  }
 }
});
test('iOS shortcut link passes a bounded duration and explains setup',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'userAgent',{get:()=> 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'}));
 await page.goto('/');
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
 await page.getByRole('button',{name:'Não Perturbe',exact:true}).click();
 const sheet=page.getByRole('dialog',{name:'Não Perturbe'});
 await expect(sheet.getByRole('link',{name:'Executar atalho (25 min)'})).toHaveAttribute('href','shortcuts://run-shortcut?name=Focora%20-%20Silenciar&input=text&text=25');
 await sheet.getByRole('button',{name:'Como criar o atalho'}).click();
 await expect(sheet).toContainText('Focora - Silenciar');
 await sheet.getByRole('combobox',{name:'Duração do silêncio'}).click();
 await page.getByRole('option',{name:'50 min',exact:true}).click();
 await expect(sheet.getByRole('link',{name:'Executar atalho (50 min)'})).toHaveAttribute('href',/text=50$/);
});
