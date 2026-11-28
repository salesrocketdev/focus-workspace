import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./offline-tests',use:{baseURL:'http://127.0.0.1:4174/focus-workspace/'},
 webServer:{command:'npm run build -- --base=/focus-workspace/ && npm run preview -- --base=/focus-workspace/ --port 4174 --strictPort',url:'http://127.0.0.1:4174/focus-workspace/',reuseExistingServer:false,timeout:120000},
 outputDir:'test-results/offline',
 projects:[{name:'offline-desktop',use:{...devices['Desktop Chrome']}},{name:'offline-mobile',use:{...devices['Pixel 7'],deviceScaleFactor:1}}]
});
