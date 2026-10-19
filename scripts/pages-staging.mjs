import {cp,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

// Pages requires a standard wrangler.jsonc in its working directory. Stage only
// code and the allowlisted build, keeping the original checkout/config intact.
export async function preparePagesDeploy({root,buildDir,destination,config}){
 const stage=path.resolve(destination),source=path.resolve(root);
 if(stage===source||stage.startsWith(path.resolve(buildDir)+path.sep))throw Error('Ongeldige publicatiemap.');
 await mkdir(stage,{recursive:false});
 const allowed=p=>!path.basename(p).startsWith('.')&&!/\.(env|log|bak|sql|md)$/i.test(p);
 for(const dir of ['functions','cloudflare','shared','admin'])await cp(path.join(source,dir),path.join(stage,dir),{recursive:true,filter:allowed});
 await cp(buildDir,path.join(stage,'public'),{recursive:true,filter:allowed});
 await writeFile(path.join(stage,'wrangler.jsonc'),JSON.stringify({...config,pages_build_output_dir:'./public'},null,2));
 return stage;
}
