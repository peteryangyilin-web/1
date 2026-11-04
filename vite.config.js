import {defineConfig,loadEnv} from 'vite';
import {readFileSync} from 'node:fs';
import {publicSupabaseConfig} from './src/accounts/workspace.js';
import publicProject from './src/accounts/project.public.json';
export default defineConfig(({mode})=>{
 const config=publicSupabaseConfig(loadEnv(mode,process.cwd(),'VITE_'),publicProject);
 if(config.error)throw new Error(config.error);
 const sql=readFileSync(new URL('./supabase/migrations/202611040001_go_accounts.sql',import.meta.url),'utf8');
 const assets={'/setup/go-accounts.sql':{source:sql,type:'text/plain; charset=utf-8'},'/setup/project.json':{source:JSON.stringify({projectUrl:config.url||''}),type:'application/json; charset=utf-8'}};
 const setupAssets={name:'go-setup-assets',generateBundle(){for(const [path,asset] of Object.entries(assets))this.emitFile({type:'asset',fileName:path.slice(1),source:asset.source})},configureServer(server){server.middlewares.use((req,res,next)=>{const asset=assets[req.url?.split('?')[0]];if(!asset)return next();res.setHeader('Content-Type',asset.type);res.end(asset.source)})}};
 return {plugins:[setupAssets],build:{rollupOptions:{output:{manualChunks:{'account-service':['@supabase/supabase-js'],'react-vendor':['react','react-dom']}}}}};
});
