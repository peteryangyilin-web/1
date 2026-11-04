import {defineConfig,loadEnv} from 'vite';
import {publicSupabaseConfig} from './src/accounts/workspace.js';
export default defineConfig(({mode})=>{
 const config=publicSupabaseConfig(loadEnv(mode,process.cwd(),'VITE_'));
 if(config.error)throw new Error(config.error);
 return {build:{rollupOptions:{output:{manualChunks:{'account-service':['@supabase/supabase-js'],'react-vendor':['react','react-dom']}}}}};
});
