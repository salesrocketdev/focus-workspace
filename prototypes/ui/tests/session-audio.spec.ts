import { openNavigation } from '../navigate-test';
import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('focus-workspace:v4:onboarding',JSON.stringify('guest'));
  let played=0;
  Object.defineProperty(window,'playedTones',{get:()=>played});
  const param=()=>({setValueAtTime:()=>{},linearRampToValueAtTime:()=>{}});
  class FakeAudio {
   state='running';currentTime=0;destination={};resume=async()=>{};
   createOscillator(){return {type:'sine',frequency:param(),connect:()=>{},disconnect:()=>{},start:()=>{played++},stop:()=>{}}}
   createGain(){return {gain:param(),connect:()=>{},disconnect:()=>{}}}
  }
  Object.defineProperty(window,'AudioContext',{configurable:true,value:FakeAudio});
 });
});
test('audio preferences persist, quiet hours suppress external alerts while preserving inbox',async({page},info)=>{
 await page.goto('/');
 const nav=page.locator(info.project.name==='mobile'?'.bottom-nav':'.sidebar nav');
 const settings=async()=>{await openNavigation(nav,info.project.name==='mobile'?'Ajustes':'Configurações');await page.getByRole('navigation',{name:'Seções de configurações'}).getByRole('button',{name:'Notificações',exact:true}).click()};
 const played=()=>page.evaluate(()=>(window as unknown as {playedTones:number}).playedTones);
 await settings();
 await page.getByRole('switch',{name:'Som ao concluir foco ou pausa'}).click();
 await page.getByRole('switch',{name:'Som ao iniciar foco'}).click();
 await page.getByRole('combobox',{name:'Som do alerta'}).click();
 await page.getByRole('option',{name:'Sino',exact:true}).click();
 await page.getByRole('slider',{name:'Volume do alerta'}).focus();
 await page.keyboard.press('End');
 await page.getByRole('button',{name:'Ouvir conclusão',exact:true}).click();
 await expect.poll(played).toBe(3);
 await page.getByRole('switch',{name:'Ativar horário silencioso'}).click();
 await page.getByLabel('Início do silêncio').fill('00:00');
 await page.getByLabel('Fim do silêncio').fill('00:00');
 await expect(page.getByText(/Silêncio ativo agora/)).toBeVisible();
 await page.getByRole('button',{name:'Ouvir início',exact:true}).click();
 await expect(page.getByText('Horário silencioso ativo. Desative-o para ouvir a prévia.')).toBeVisible();
 expect(await played()).toBe(3);
 await page.getByRole('button',{name:'Enviar notificação de teste'}).click();
 await expect(page.getByText('Horário silencioso ativo: aviso salvo apenas na central interna.')).toBeVisible();
 await page.getByRole('button',{name:'Abrir notificações'}).click();
 await expect(page.getByRole('dialog',{name:'Notificações'})).toContainText('Notificação de teste');
 await page.getByRole('dialog',{name:'Notificações'}).getByRole('button',{name:'Fechar',exact:true}).click();
 await page.reload();
 await settings();
 await expect(page.getByRole('switch',{name:'Som ao iniciar foco'})).toHaveAttribute('aria-checked','true');
 await expect(page.getByRole('combobox',{name:'Som do alerta'})).toHaveText('Sino');
 await expect(page.getByRole('slider',{name:'Volume do alerta'})).toHaveValue('100');
 await expect(page.getByText(/Silêncio ativo agora/)).toBeVisible();
 await page.getByRole('switch',{name:'Ativar horário silencioso'}).click();
 await nav.getByRole('button',{name:'Hoje',exact:true}).click();
 await page.clock.install();
 await page.getByRole('button',{name:'Iniciar foco',exact:true}).click();
 await expect.poll(played).toBe(2);
 await page.clock.fastForward(1501000);
 await expect.poll(played).toBe(5);
 await page.getByRole('button',{name:'Abrir notificações'}).click();
 await expect(page.getByRole('dialog',{name:'Notificações'})).toContainText('Sessão de foco concluída');
});
