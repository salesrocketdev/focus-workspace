import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')))});
test('mobile filters remain on one line and use lightweight active styling',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Mobile geometry');
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 const checkTabs=async(name:string)=>{
  const group=page.getByRole('group',{name});
  const buttons=group.getByRole('button');
  await expect(buttons).toHaveCount(3);
  const rects=await buttons.evaluateAll(nodes=>nodes.map(n=>{const el=n as HTMLElement;const rect=el.getBoundingClientRect();return {y:rect.y,h:rect.height,bg:getComputedStyle(el).backgroundColor}}));
  expect(rects.every(r=>r.h>=44&&r.h<=45)).toBeTruthy();
  expect(Math.max(...rects.map(r=>r.y))-Math.min(...rects.map(r=>r.y))).toBeLessThan(1);
  expect(rects.every(r=>r.bg==='rgba(0, 0, 0, 0)'||r.bg==='transparent')).toBeTruthy();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 };
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:844});
  await nav.getByRole('button',{name:'Agenda',exact:true}).click();
  await checkTabs('Visualização da agenda');
  await nav.getByRole('button',{name:'Histórico',exact:true}).click();
  await checkTabs('Período do histórico');
  await nav.getByRole('button',{name:'Atividades',exact:true}).click();
  await checkTabs('Seções de atividades');
  await page.getByRole('button',{name:'Tarefas',exact:true}).click();
  await checkTabs('Status das tarefas');
  await page.getByRole('button',{name:'Pendentes',exact:true}).click();
  await expect(page.getByRole('button',{name:'Pendentes',exact:true})).toHaveAttribute('aria-pressed','true');
 }
 await page.screenshot({path:info.outputPath('mobile-clean-activity-filters.png'),animations:'disabled',scale:'css'});
 await nav.getByRole('button',{name:'Agenda',exact:true}).click();
 await page.screenshot({path:info.outputPath('mobile-clean-agenda.png'),animations:'disabled',scale:'css'});
 await nav.getByRole('button',{name:'Histórico',exact:true}).click();
 await page.getByRole('button',{name:'Linha',exact:true}).click();
 const card=page.locator('.focus-trend-card');
 await expect(card).toContainText('2h 15min');
 await expect(card.locator('.chart-line')).toBeVisible();
 await expect(card.locator('.chart-dot')).toHaveCount(7);
 await card.getByRole('button',{name:'Dia anterior no gráfico'}).click();
 await expect(card.getByRole('status',{name:'Detalhes do dia'})).toContainText('1h 42min');
 await page.getByRole('button',{name:'30 dias',exact:true}).click();
 await expect(card.locator('.chart-dot')).toHaveCount(30);
 await card.scrollIntoViewIfNeeded();
 await page.screenshot({path:info.outputPath('mobile-clean-focus-trend.png'),animations:'disabled',scale:'css'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});
