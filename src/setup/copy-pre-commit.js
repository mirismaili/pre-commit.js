/**
 * Created on 1400/3/31 (2021/6/21).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */

import {copyFile, readFile, rename} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'

if (JSON.parse(await readFile('package.json', 'utf-8')).name === 'eslint-pre-commit-hook') process.exit()

const {gitPreCommitPath, libPreCommitPath, oldPreCommitPath} = await import('./pre-commits-paths.js')

await rename(gitPreCommitPath, oldPreCommitPath).catch(() => {})

await copyFile(libPreCommitPath, gitPreCommitPath).then(() =>
  console.info(`"pre-commit" hook set: %s\nMake sure it's executable.`, pathToFileURL(gitPreCommitPath)),
)
