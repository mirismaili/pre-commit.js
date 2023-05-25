/**
 * Created on 1401/12/18 (2023/3/9).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */

export const transpose = (matrix) => matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]))
