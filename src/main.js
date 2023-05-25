#!/usr/bin/env node

/**
 * Created on 1400/4/1 (2021/6/22).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */

import {ESLint} from 'eslint'
import {exec as legacyExec} from 'node:child_process'
import {readFile} from 'node:fs/promises'
import util from 'node:util'

const exec = util.promisify(legacyExec)

const {stdout, stderr} = await exec(
  'git diff --cached --name-only --diff-filter=ACMRTUXB', // `ACMRTUXB` => all changes except "Delete". See:
  // https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---diff-filterACDMRTUXB82308203
)

if (stderr) throw Error(stderr)

const eslint = new ESLint()

const files = (await Promise.all(
  stdout.split('\n')
    .filter((relativePath) => /\.m?[jt]sx?$/.test(relativePath))
    .map(
      async (relativePath) => await eslint.isPathIgnored(relativePath).then((ignored) => !ignored && relativePath),
    ),
)).filter(Boolean)

if (!files.length) {
  console.info('No file to lint before commit.')
  process.exit()
}
console.info('>> Linting:', '\n\t' + files.join('\n\t'), '\n')
const results = await eslint.lintFiles(files)

console.info((await eslint.loadFormatter('stylish')).format(results))

const [numErrors, numWarnings] = results.reduce(
  ([numErrors, numWarnings], {errorCount, warningCount}) => [numErrors + errorCount, numWarnings + warningCount],
  [0, 0],
)

// noinspection JSUnresolvedVariable
/** @type {{breakOnWarningsToo: boolean}} */
const config = JSON.parse(await readFile('package.json', 'utf-8')).eslintPreCommit ?? {}

const numUnacceptableProblems = numErrors + (config.breakOnWarningsToo ? numWarnings : 0)

console.info('\n' + (
  numUnacceptableProblems
    ? `Pre-commit process FAILED because of ${numUnacceptableProblems} unacceptable ${numUnacceptableProblems === 1 ? 'problem' : 'problems'}!`
    : 'Pre-commit process SUCCEEDED.'
))
process.exit(numUnacceptableProblems)
