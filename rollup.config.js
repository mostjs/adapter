import typescript from 'typescript'
import nodeResolve from 'rollup-plugin-node-resolve'
import ts from 'rollup-plugin-typescript2'
import pkg from './package.json'

export default {
  input: 'src/index.ts',
  plugins: [
    nodeResolve(),
    ts({ typescript })
  ],
  output: [{
    file: pkg.module,
    format: 'es',
    sourcemap: true
  }, {
    file: pkg.main,
    format: 'cjs',
    sourcemap: true
  }]
}