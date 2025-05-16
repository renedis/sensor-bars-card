import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/sensor-bars-card.ts',
  output: {
    file: 'dist/sensor-bars-card.js',
    format: 'es'
  },
  plugins: [
    resolve(),
    typescript()
  ]
};