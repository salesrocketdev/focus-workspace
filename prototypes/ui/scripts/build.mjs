import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join,relative,resolve,sep} from 'node:path';

// Keep Vite CLI arguments (including the GitHub Pages --base) intact.
const args=process.argv.slice(2);
if(args.some(a=>a==='--outDir'||a.startsWith('--outDir=')))throw new Error('Prototype build uses the default dist output directory.');
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build',...args],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
const dir=resolve('dist');
async function walk(folder){
 const entries=await readdir(folder,{withFileTypes:true});
 const paths=await Promise.all(entries.map(e=>e.isDirectory()?walk(join(folder,e.name)):[join(folder,e.name)]));
 return paths.flat();
}
const files=(await walk(dir)).map(p=>relative(dir,p).split(sep).join('/')).filter(p=>p!=='sw.js').sort();
if(!files.includes('index.html')||!files.includes('manifest.webmanifest')||!files.some(p=>p.startsWith('assets/')&&p.endsWith('.js')))throw new Error('Incomplete offline app shell');
const workerPath=join(dir,'sw.js'),template=await readFile(workerPath,'utf8');
const hash=createHash('sha256').update(template);
for(const path of files){hash.update(path+'\0');hash.update(await readFile(join(dir,path)));hash.update('\0')}
const build={version:hash.digest('hex').slice(0,20),files};
if(!template.includes('const BUILD = null;'))throw new Error('Offline worker build marker missing');
await writeFile(workerPath,template.replace('const BUILD = null;','const BUILD = '+JSON.stringify(build)+';'));
console.log('Offline shell '+build.version+': '+files.length+' files');
