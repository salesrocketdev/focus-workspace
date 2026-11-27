import {defineConfig,devices} from '@playwright/test';
// Independent of Vite dev server: exercise the deployed GitHub Pages URL.
export default defineConfig({
 testDir:'./live-audit',timeout:120000,expect:{timeout:15000},workers:2,
 reporter:[['list'],['html',{outputFolder:'live-audit-report',open:'never'}]],
 outputDir:'live-audit-results',
 use:{baseURL:'https://salesrocketdev.github.io/focus-workspace/',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[
  {name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1366,height:768}}},
  {name:'tablet',use:{...devices['Desktop Chrome'],viewport:{width:768,height:1024},hasTouch:true}},
  {name:'mobile-narrow',use:{...devices['Pixel 7'],viewport:{width:320,height:740},deviceScaleFactor:1}},
  {name:'iphone-webkit',use:{...devices['iPhone 13'],browserName:'webkit',deviceScaleFactor:1}}
 ]
});
