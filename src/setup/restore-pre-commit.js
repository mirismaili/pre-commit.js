/**
 * Created on 1400/3/31 (2021/6/21).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */

import fs from 'node:fs/promises'
import {gitPreCommitPath, oldPreCommitPath} from './pre-commits-paths.js'

await fs.rename(oldPreCommitPath, gitPreCommitPath)
  .then(() => console.info('The old "pre-commit" file restored.'))
  .catch(async () => await fs.unlink(gitPreCommitPath).then(() => console.info('Created "pre-commit" file deleted.')))
