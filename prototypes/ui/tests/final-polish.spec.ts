import { openNavigation } from '../navigate-test';
import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')))});
test('mobile dashboard controls and short focus viewport',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Mobile geometry');
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 const widget=page.locator('.workspace:not(.editing) [data-widget=focus]');
 const action=widget.getByRole('button',{name:'Iniciar foco',exact:true});
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:740});
  await expect(action.locator('span')).toBeVisible();
  const rects=await page.locator('.quick-action-button:visible,[data-widget=music] .player-controls button:visible,.timer-start:visible').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return [r.width,r.height]}));
  expect(rects.length).toBeGreaterThan(0);
  expect(rects.every(([w,h])=>w>=44&&h>=44)).toBeTruthy();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  await page.screenshot({path:info.outputPath('final-dashboard-'+width+'.png'),animations:'disabled',scale:'css'});
 }
 await action.click();await expect(widget.getByRole('button',{name:'Pausar foco',exact:true})).toBeVisible();
 await widget.getByRole('button',{name:'Pausar foco',exact:true}).click();
 await nav.getByRole('button',{name:'Agenda',exact:true}).click();
 expect(await page.getByRole('button',{name:'Hoje',exact:true}).evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(44);
 await openNavigation(nav,'Histórico');
 const selected=page.locator('.focus-trend-card .history-bar-column[aria-pressed=true] .history-bar-track');
 expect(await selected.evaluate(el=>parseFloat(getComputedStyle(el,'::before').width))).toBeLessThanOrEqual(32);
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
 await page.setViewportSize({width:390,height:640});
 await expect(page.locator('.focus-center .transport')).toBeVisible();
 expect(await page.locator('.focus-center .ring-large').evaluate(el=>el.getBoundingClientRect().width)).toBeLessThanOrEqual(220);
 await page.screenshot({path:info.outputPath('final-short-focus.png'),animations:'disabled',scale:'css'});
});
