import { openNavigation } from '../navigate-test';
import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')))});
test('mobile category rows and book actions are compact and accessible',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Mobile layout');
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 await openNavigation(nav,'Atividades');
 for(const width of [320,360,390,430]){
  await page.setViewportSize({width,height:844});
  const rows=page.locator('.category-focus-row');
  await expect(rows).toHaveCount(4);
  const geometry=await rows.evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect(),icon=n.querySelector('.category-focus-indicator')!.getBoundingClientRect(),copy=n.querySelector('.category-row-copy')!.getBoundingClientRect();return {x:r.x,w:r.width,h:r.height,right:r.right,copyRight:copy.right,iconLeft:icon.left,iconRight:icon.right}}));
  expect(geometry.every(r=>r.h>=44&&r.w>=44&&r.copyRight<=r.iconLeft&&r.iconRight<=r.right)).toBeTruthy();
  expect(geometry.every(r=>Math.abs(r.x-geometry[0].x)<1)).toBeTruthy();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 }
 await page.screenshot({path:info.outputPath('mobile-category-rows.png'),animations:'disabled',scale:'css'});
 await page.getByRole('button',{name:'Iniciar foco em Trabalho',exact:true}).click();
 await expect(page.locator('.focus-activity-panel h2')).toHaveText('Trabalho');
 await page.getByRole('button',{name:'Ver atividades',exact:true}).click();
 await page.getByRole('button',{name:'Leituras',exact:true}).click();
 const book=page.locator('.activity-book').first();
 await expect(book.getByRole('button',{name:'Detalhes de Clean Architecture'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Adicionar livro',exact:true})).toBeVisible();
 const buttons=await book.locator('.book-row-actions button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {y:r.y,h:r.height,w:r.width}}));
 expect(buttons.every(b=>b.h>=44&&b.w>=44)).toBeTruthy();
 expect(Math.abs(buttons[0].y-buttons[1].y)).toBeLessThan(1);
 await book.getByRole('button',{name:'Detalhes de Clean Architecture'}).click();
 await expect(page.getByRole('dialog',{name:'Detalhes do livro'})).toBeVisible();
 await page.getByRole('button',{name:'Concluir',exact:true}).click();
 await page.screenshot({path:info.outputPath('mobile-library-rows.png'),animations:'disabled',scale:'css'});
});
