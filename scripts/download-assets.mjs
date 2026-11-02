import {mkdir,writeFile} from 'node:fs/promises';
import {photoSources,roomTypes} from '../src/data.js';
await mkdir('public/images',{recursive:true});
for(const [name,url] of [...Object.entries(photoSources),...roomTypes.map(r=>['room-'+r.id,r.sourceImage])]){
 const response=await fetch(url);if(!response.ok)throw new Error(`${name}: ${response.status}`);
 const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<1000)throw new Error('Invalid image');
 await writeFile(`public/images/${name}.jpg`,bytes);console.log(`${name}: ${bytes.length} bytes`);
}
