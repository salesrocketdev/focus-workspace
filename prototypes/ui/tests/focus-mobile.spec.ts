import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest')))});
test('mobile immersive controls are compact, aligned and usable',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Mobile geometry');
 await page.goto('/');
 await page.getByRole('button',{name:'Abrir sessão de foco',exact:true}).click();
 const focus=page.locator('.focus-center'),controls=focus.locator('.transport');
 const method=focus.getByRole('group',{name:'Método de foco'});
 const start=controls.getByRole('button',{name:'Iniciar',exact:true});
 for(const width of [320,360,390,430]){
  await page.setViewportSize({width,height:844});
  const boxes=await controls.getByRole('button').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,bg:getComputedStyle(n).backgroundColor,fg:getComputedStyle(n).color}}));
  expect(boxes.length).toBe(3);expect(boxes.every(b=>b.w>=44&&b.h>=44)).toBeTruthy();
  expect(Math.max(...boxes.map(b=>b.y))-Math.min(...boxes.map(b=>b.y))).toBeLessThan(1);
  expect(boxes[1].w).toBeGreaterThan(boxes[0].w);
  // Secondary controls have opaque surfaces over scene art; verify actual contrast.
  const luminance=(color:string)=>{
   const rgb=color.match(/[\d.]+/g)?.slice(0,3).map(Number);
   if(!rgb||rgb.length!==3)throw new Error('Unexpected computed color: '+color);
   return rgb.map(v=>{const n=v/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  };
  for(const box of [boxes[0],boxes[2]]){
   expect(box.bg).toMatch(/^rgb\(/);
   const a=luminance(box.fg),b=luminance(box.bg);
   expect((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toBeGreaterThanOrEqual(4.5);
  }
  expect(boxes[0].bg).toBe(boxes[2].bg);
  expect(boxes[1].bg).not.toBe(boxes[0].bg);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  await expect(focus.getByRole('button',{name:'Configurar sessão de foco',exact:true})).toBeVisible();
  await expect(focus.getByRole('button',{name:'Não perturbe',exact:true})).toBeVisible();
 }
 await start.click();
 await expect(method).toBeHidden();
 await page.getByRole('button',{name:'Controles',exact:true}).click();
 await expect(method.getByRole('button',{name:'Livre',exact:true})).toBeDisabled();
 await expect(controls.getByRole('button',{name:'Pausar',exact:true})).toBeVisible();
 await controls.getByRole('button',{name:'Pausar',exact:true}).click();
 await controls.getByRole('button',{name:'Reiniciar',exact:true}).click();
 if(await page.getByRole('dialog',{name:'Descartar sessão atual?'}).isVisible())await page.getByRole('button',{name:'Descartar e reiniciar',exact:true}).click();
 await expect(method.getByRole('button',{name:'Livre',exact:true})).toBeEnabled();
 await method.getByRole('button',{name:'Livre',exact:true}).click();
 await expect(method.getByRole('button',{name:'Livre',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.screenshot({path:info.outputPath('mobile-focus-controls.png'),animations:'disabled',scale:'css'});
});
