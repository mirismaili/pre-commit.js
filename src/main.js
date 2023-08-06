#!/usr/bin/env node

/**
 * Created on 1402/3/4 (2023/5/25).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */

import {exec as legacyExec} from 'node:child_process'
import {readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import util from 'node:util'

const exec = util.promisify(legacyExec)

const {preCommitScript} = JSON.parse(await readFile('package.json', 'utf-8'))

if (!preCommitScript) {
  console.info('No script specified to be done before commit. To specify a one, put its path in `preCommitScript` field in your "package.json" file. Only Node.js scripts are acceptable.')
  process.exit(0)
}

const {stdout, stderr} = await exec(
  'git diff --cached --name-only --diff-filter=ACMRTUXB', // `ACMRTUXB` => all changes except "Delete". See:
  // https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---diff-filterACDMRTUXB82308203
)
if (stderr) console.error(stderr)

const trimmedOutput = stdout.trimEnd()
const files = trimmedOutput ? trimmedOutput.split('\n') : [] // Avoid `['']`

if (!files.length) {
  console.info('No new/modified file to commit.')
  process.exit(0)
}
console.info(
  'Processing added/modified files using %s:\n\t%s\n',
  resolve(preCommitScript),
  files.map((file) => resolve(file)).join('\n\t'),
)
const {default: preCommit} = await import((pathToFileURL(preCommitScript).href))

await preCommit(files).catch((err) => {
  console.error(err)
  process.exit(1)
})
