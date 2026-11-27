import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')))});
test('WebKit mobile: immersive header, real route animation and sheet filters',async({page},info)=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Navegação principal'});
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
 await expect(nav).toHaveCount(0);
 const header=page.locator('.focus-top');
 const bounds=await header.evaluate(el=>{const a=el.getBoundingClientRect(),b=el.querySelector('h1')!.getBoundingClientRect();return Math.abs(a.x+a.width/2-(b.x+b.width/2))});
 expect(bounds).toBeLessThan(2);
 await page.screenshot({path:info.outputPath('iphone-immersive.png'),animations:'disabled'});
 await page.getByRole('button',{name:'Fechar foco',exact:true}).click();
 await expect(nav).toBeVisible();
 await page.evaluate(()=>{(window as Window&{motionEvents?:string[]}).motionEvents=[];document.addEventListener('animationstart',e=>{if(e.target instanceof HTMLElement&&e.target.matches('[data-route]'))(window as Window&{motionEvents?:string[]}).motionEvents?.push(e.animationName)})});
 await nav.getByRole('button',{name:'Histórico',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as Window&{motionEvents?:string[]}).motionEvents??[])).toContain('route-enter');
 await page.getByRole('button',{name:'Abrir filtros do histórico'}).click();
 const sheet=page.getByRole('dialog',{name:'Filtros do histórico'});
 await expect(sheet).toBeVisible();
 await sheet.getByRole('combobox',{name:'Categoria do histórico'}).click();
 await page.getByRole('option',{name:'Leitura',exact:true}).click();
 await sheet.getByRole('button',{name:'Aplicar filtros'}).click();
 await expect(page.getByText('1 filtro(s) aplicado(s)')).toBeVisible();
 await page.getByRole('button',{name:'Abrir filtros do histórico'}).click();
 await sheet.getByRole('button',{name:'Limpar',exact:true}).click();
 await sheet.getByRole('button',{name:'Fechar diálogo'}).click();
 await expect(page.getByText('1 filtro(s) aplicado(s)')).toBeVisible();
 await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();
 await expect(page.getByText('1 filtro(s) aplicado(s)')).toHaveCount(0);
});
test('WebKit mobile: sheet opens without focusing text and fits resized visual viewport',async({page},info)=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Abrir ações rápidas',exact:true}).click();
 const sheet=page.getByRole('dialog',{name:'Ações rápidas'});
 const search=sheet.getByRole('searchbox');
 await expect(search).not.toBeFocused();
 await search.click();
 await search.fill('agenda');
 // Desktop WebKit emulates iPhone viewport, not the real iOS keyboard.
 // Override viewport height to exercise the same resize handler.
 await page.evaluate(()=>{const vv=window.visualViewport!;Object.defineProperty(vv,'height',{configurable:true,get:()=>400});Object.defineProperty(vv,'offsetTop',{configurable:true,get:()=>0});vv.dispatchEvent(new Event('resize'))});
 await expect(sheet).toHaveAttribute('data-keyboard','open');
 expect(await sheet.evaluate(el=>el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(402);
 await page.screenshot({path:info.outputPath('iphone-keyboard-sheet.png'),animations:'disabled'});
});

test('WebKit: interactive history plots respond to touch and reduced motion',async({page})=>{
 await page.goto('/');
 await page.getByRole('navigation',{name:'Navegação principal'}).getByRole('button',{name:'Histórico',exact:true}).click();
 await page.getByRole('button',{name:'Dia anterior no gráfico'}).tap();
 await expect(page.getByRole('status',{name:'Detalhes do dia'})).toContainText('1h 42min');
 await page.getByRole('button',{name:'Linha',exact:true}).tap();
 await expect(page.locator('.chart-line')).toBeVisible();
 await page.getByRole('group',{name:'Categorias do gráfico'}).getByRole('button',{name:/Leitura/}).tap();
 await expect(page.getByRole('status',{name:'Detalhes da categoria'})).toContainText('Leitura');
 await page.emulateMedia({reducedMotion:'reduce'});
 expect(await page.locator('.chart-line').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});

test('WebKit: clean focus controls preserve touch targets and timer actions',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).tap();
 const transport=page.locator('.focus-center .transport');
 const sizes=await transport.getByRole('button').evaluateAll(nodes=>nodes.map(n=>[n.getBoundingClientRect().width,n.getBoundingClientRect().height]));
 expect(sizes.every(([w,h])=>w>=44&&h>=44)).toBeTruthy();
 await transport.getByRole('button',{name:'Iniciar',exact:true}).tap();
 await expect(transport.getByRole('button',{name:'Pausar',exact:true})).toBeVisible();
 await transport.getByRole('button',{name:'Pausar',exact:true}).tap();
 await transport.getByRole('button',{name:'Reiniciar',exact:true}).tap();
 await expect(transport.getByRole('button',{name:'Iniciar',exact:true})).toBeVisible();
 await expect(page.getByRole('navigation',{name:'Navegação principal'})).toHaveCount(0);
});

// The same mobile matrix runs under real desktop WebKit with iPhone emulation.
import './mobile-matrix.spec';
