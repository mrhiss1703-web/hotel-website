import {copyFile, cp, readdir, rename} from 'node:fs/promises';

// Keep a complete dist preview and a directly publishable repository root.
await rename('dist/dev.html', 'dist/index.html');
for (const entry of await readdir('dist', {withFileTypes: true})) {
  if (entry.isDirectory()) {
    await cp(`dist/${entry.name}`, entry.name, {recursive: true});
  } else {
    await copyFile(`dist/${entry.name}`, entry.name);
  }
}
console.log('Static website published to index.html, assets/ and images/.');
