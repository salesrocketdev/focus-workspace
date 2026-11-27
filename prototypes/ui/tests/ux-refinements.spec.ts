import { openNavigation } from '../navigate-test';
import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>{if(!localStorage.getItem('focus-workspace:v4:onboarding'))localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest'))})});
test('desktop filter toolbar uses compact labeled fields and reset',async({page},info)=>{
 test.skip(info.project.name!=='desktop','Desktop filter layout');
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 await openNavigation(nav,'Histórico');
 const bar=page.getByRole('group',{name:'Filtros do histórico'});
 await expect(bar.getByRole('combobox')).toHaveCount(3);
 await bar.getByRole('combobox',{name:'Categoria do histórico'}).click();
 await page.getByRole('option',{name:'Leitura',exact:true}).click();
 await expect(bar.getByRole('button',{name:'Limpar filtros'})).toBeEnabled();
 await bar.getByRole('button',{name:'Limpar filtros'}).click();
 await expect(bar.getByRole('combobox',{name:'Categoria do histórico'})).toContainText('Todas');
 await expect(bar.getByRole('button',{name:'Limpar filtros'})).toBeDisabled();
 for(const width of [760,1024,1366]){
  await page.setViewportSize({width,height:768});
  const fields=await bar.getByRole('combobox').evaluateAll(nodes=>nodes.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,height:r.height}}));
  expect(fields.every(f=>f.height===36)).toBeTruthy();
  expect(Math.max(...fields.map(f=>f.top))-Math.min(...fields.map(f=>f.top))).toBeLessThanOrEqual(1);
  expect(fields.every((f,i)=>i===0||f.left>=fields[i-1].right)).toBeTruthy();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  await bar.screenshot({path:info.outputPath('desktop-filters-'+width+'.png')});
 }
});
test('focus scene persists, supports none and restores original',async({page},info)=>{
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 const settings=async()=>{await openNavigation(nav,info.project.name==='mobile'?'Ajustes':'Configurações');await page.getByRole('navigation',{name:'Seções de configurações'}).getByRole('button',{name:'Aparência',exact:true}).click()};
 await settings();
 const options=page.getByRole('group',{name:'Cenário do modo foco'});
 await expect(options.getByRole('button')).toHaveCount(6);
 await options.getByRole('button',{name:'Aurora',exact:true}).click();
 await page.reload();await settings();
 await expect(options.getByRole('button',{name:'Aurora',exact:true})).toHaveAttribute('aria-pressed','true');
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
 await expect(page.locator('.focus-landscape')).toHaveAttribute('data-focus-scene','aurora');
 await page.getByRole('button',{name:'Voltar',exact:true}).click();await settings();
 await options.getByRole('button',{name:'Sem cenário',exact:true}).click();
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
 await expect(page.locator('.focus-landscape')).toHaveCount(0);
});
