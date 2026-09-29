import fs from 'fs/promises';
import path from 'path';
import * as babel from '@babel/core';

async function walk(dir, callback) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    const stat = await fs.stat(p);
    if (stat.isDirectory()) {
      await walk(p, callback);
    } else {
      await callback(p);
    }
  }
}

async function run() {
  await walk('src', async (p) => {
    if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      if (p.includes('routeTree.gen.ts')) {
        await fs.unlink(p);
        return;
      }
      const code = await fs.readFile(p, 'utf-8');
      const result = await babel.transformAsync(code, {
        plugins: ['@babel/plugin-syntax-jsx'],
        presets: [
          ['@babel/preset-typescript', { ignoreExtensions: true }]
        ],
        filename: p,
        retainLines: true,
      });
      let newP = p.replace(/\.tsx?$/, p.endsWith('.tsx') ? '.jsx' : '.js');
      await fs.writeFile(newP, result.code);
      await fs.unlink(p);
      console.log(`Transformed ${p} -> ${newP}`);
    }
  });
  
  const vCode = await fs.readFile('vite.config.ts', 'utf-8');
  const vResult = await babel.transformAsync(vCode, {
    presets: [['@babel/preset-typescript', { isTSX: false }]],
    filename: 'vite.config.ts',
    retainLines: true,
  });
  await fs.writeFile('vite.config.js', vResult.code);
  await fs.unlink('vite.config.ts');
  console.log('Transformed vite.config.ts -> vite.config.js');
}

run().catch(console.error);
