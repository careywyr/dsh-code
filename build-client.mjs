#!/usr/bin/env node
// Rebuild lib/client.js from the src-client parts.
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const dir = path.dirname(fileURLToPath(import.meta.url))
const parts = ['part1.js', 'part2.js', 'part3.js'].map((p) => readFileSync(path.join(dir, 'src-client', p), 'utf8'))
writeFileSync(path.join(dir, 'lib', 'client.js'), parts.join(''))
console.log('built lib/client.js (' + parts.join('').length + ' chars)')
