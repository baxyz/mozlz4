/**
 * Copyright (C) 2026 baxyz
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

const { name, version, description, keywords, homepage, bugs, repository, license, author, type, exports, main, module, types, sideEffects, engines } = pkg

const stripDist = (v: string) => v.replace('./dist/', './')

const publishPkg = {
  name, version, description, keywords, homepage, bugs, repository, license, author, type,
  exports: JSON.parse(JSON.stringify(exports, (_, v) => (typeof v === 'string' ? stripDist(v) : v))),
  main: stripDist(main),
  module: stripDist(module),
  types: stripDist(types),
  sideEffects,
  engines,
}

writeFileSync(resolve(dist, 'package.json'), JSON.stringify(publishPkg, null, 2) + '\n')
copyFileSync(resolve(root, 'README.md'), resolve(dist, 'README.md'))
copyFileSync(resolve(root, 'LICENSE'), resolve(dist, 'LICENSE'))

console.log('pack: dist/package.json generated')
