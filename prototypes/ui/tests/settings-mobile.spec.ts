import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')))});
test('mobile settings list, detail, summaries and return',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Mobile only');
 await page.goto('/');
 await page.getByRole('navigation',{name:'Navegação principal'}).getByRole('button',{name:'Ajustes',exact:true}).click();
 const sections=page.getByRole('navigation',{name:'Seções de configurações'});
 await expect(sections.getByRole('button')).toHaveCount(5);
 await expect(page.getByRole('combobox',{name:'Duração do Pomodoro'})).toHaveCount(0);
 await page.screenshot({path:info.outputPath('settings-mobile-index.png'),animations:'disabled',scale:'css'});
 await sections.getByRole('button',{name:'Sessões de foco',exact:true}).click();
 await expect(sections).toHaveCount(0);
 await page.getByRole('combobox',{name:'Duração do Pomodoro'}).click();
 await page.getByRole('option',{name:'45 minutos',exact:true}).click();
 await page.screenshot({path:info.outputPath('settings-mobile-detail.png'),animations:'disabled',scale:'css'});
 await page.getByRole('button',{name:'Voltar às configurações'}).click();
 await expect(sections.getByRole('button',{name:'Sessões de foco'})).toBeFocused();
 await expect(sections.getByText('45 min de foco · 5 min de pausa')).toBeVisible();
 await sections.getByRole('button',{name:'Aparência',exact:true}).click();
 await page.getByRole('button',{name:'Escuro',exact:true}).click();
 await page.getByRole('button',{name:'Voltar às configurações'}).click();
 await expect(sections.getByText('Tema escuro')).toBeVisible();
 for(const width of [320,360,390,430]){
  await page.setViewportSize({width,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  const sizes=await sections.getByRole('button').evaluateAll(nodes=>nodes.map(n=>(n as HTMLElement).offsetHeight));
  expect(sizes.every(h=>h>=44)).toBeTruthy();
 }
 await page.screenshot({path:info.outputPath('settings-mobile-dark.png'),animations:'disabled',scale:'css'});
});
