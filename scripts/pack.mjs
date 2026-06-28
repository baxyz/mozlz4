import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const {
  name, version, description, keywords, homepage, bugs, repository,
  license, author, type, exports, main, module, types, sideEffects, engines,
} = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

const stripDist = v => v.replace('./dist/', './')

writeFileSync(
  resolve(dist, 'package.json'),
  JSON.stringify({
    name, version, description, keywords, homepage, bugs, repository,
    license, author, type,
    exports: JSON.parse(JSON.stringify(exports, (_, v) => typeof v === 'string' ? stripDist(v) : v)),
    main: stripDist(main), module: stripDist(module), types: stripDist(types),
    sideEffects, engines,
  }, null, 2) + '\n',
)
copyFileSync(resolve(root, 'LICENSE'), resolve(dist, 'LICENSE'))
copyFileSync(resolve(root, 'README.md'), resolve(dist, 'README.md'))
console.log('pack: dist/package.json generated')
