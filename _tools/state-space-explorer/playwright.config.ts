import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests',testMatch:'**/*.e2e.ts',workers:1,reporter:'list',use:{baseURL:process.env.EXPLORER_BASE_URL??'http://127.0.0.1:5173',headless:true,viewport:{width:1512,height:1100},launchOptions:{executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']}}});
