import { execSync } from 'child_process';
import { stylesEntryPoint } from './utils.mjs';

const output = execSync(
  `sass ${stylesEntryPoint.src} ${stylesEntryPoint.dest} --no-source-map`,
  { encoding: 'utf8' }
);

if (output) {
  console.log(output);
}
