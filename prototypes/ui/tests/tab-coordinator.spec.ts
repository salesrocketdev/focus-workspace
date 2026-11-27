import {test,expect} from '@playwright/test';
const key='focus-workspace:v4:workspace';
test.beforeEach(async({context})=>{await context.addInitScript(()=>{if(!localStorage.getItem('focus-workspace:v4:onboarding'))localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest'))})});
test('one writer, synchronized timer and automatic handoff without duplicate completion',async({page,context},info)=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Iniciar foco',exact:true}).click();
 const follower=await context.newPage();await follower.goto('/');
 await expect(follower.getByText(/Sessão compartilhada/)).toBeVisible();
 await expect(follower.getByRole('button',{name:'Pausar foco',exact:true})).toBeDisabled();
 const nav=(p:typeof page)=>p.locator(info.project.name==='mobile'?'.bottom-nav':'.sidebar nav');
 await page.getByRole('button',{name:'Pausar foco',exact:true}).click();
 await expect(follower.getByRole('button',{name:'Iniciar foco',exact:true})).toBeDisabled();
 await nav(page).getByRole('button',{name:'Atividades',exact:true}).click();
 await page.getByRole('button',{name:'Nova categoria',exact:true}).click();
 await page.getByLabel('Nome da categoria').fill('Entre abas');
 await page.getByRole('button',{name:'Salvar',exact:true}).click();
 await nav(follower).getByRole('button',{name:'Atividades',exact:true}).click();
 await expect(follower.getByRole('button',{name:'Iniciar foco em Entre abas'})).toBeDisabled();
 await nav(page).getByRole('button',{name:'Hoje',exact:true}).click();
 await page.getByRole('button',{name:'Iniciar foco',exact:true}).click();
 await nav(follower).getByRole('button',{name:'Hoje',exact:true}).click();
 await expect(follower.getByRole('button',{name:'Pausar foco',exact:true})).toBeDisabled();
 await page.close();
 await expect(follower.getByRole('button',{name:'Pausar foco',exact:true})).toBeEnabled();
 await expect(follower.getByText(/Sessão compartilhada/)).toHaveCount(0);
 const third=await context.newPage();await third.goto('/');
 await expect(third.getByRole('button',{name:'Pausar foco',exact:true})).toBeDisabled();
 // Accelerate the writer clock to cross its deadline; only the writer
 // completes the phase and emits a record. The follower mirrors it.
 await follower.clock.install();
 await follower.clock.fastForward(1600000);
 await expect.poll(()=>follower.evaluate(k=>JSON.parse(localStorage.getItem(k)!).records.filter((r:{origin:string})=>r.origin==='session').length,key)).toBe(1);
 await expect(third.getByRole('button',{name:'Iniciar foco',exact:true})).toBeDisabled();
 await follower.close();
 await expect(third.getByRole('button',{name:'Iniciar foco',exact:true})).toBeEnabled();
 expect(await third.evaluate(k=>JSON.parse(localStorage.getItem(k)!).records.filter((r:{origin:string})=>r.origin==='session').length,key)).toBe(1);
 await nav(third).getByRole('button',{name:'Atividades',exact:true}).click();
 await expect(third.getByRole('button',{name:'Iniciar foco em Entre abas'})).toBeEnabled();
});
