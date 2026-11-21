import { build } from 'esbuild';
import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = resolve(rootDir, 'dist/index.cjs');

mkdirSync(dirname(outFile), { recursive: true });

await build({
  stdin: {
    contents: `
      const mod = require('./lib/fluent-ffmpeg.js');
      const ffmpeg = mod.default;
      module.exports = ffmpeg;
    `,
    resolveDir: rootDir,
    sourcefile: 'cjs-entry.cjs'
  },
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: outFile,
  external: ['async', 'which'],
  define: {
    __FLUENT_FFMPEG_CJS__: 'true',
    'import.meta.url': '__importMetaUrl'
  },
  banner: {
    js: [
      '/* Auto-generated CommonJS bundle for @wibukarbitt/fluent-ffmpeg. Do not edit manually. */',
      "const __importMetaUrl = require('url').pathToFileURL(__filename).href;"
    ].join('\n')
  }
});

console.log('Built CommonJS bundle:', outFile);
