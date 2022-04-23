import * as fs from 'fs';
import { getArgument } from './utils.mjs';

const imagePath = getArgument('--path');
const ext = imagePath.split('.').pop();

const imageAsBase64 = fs.readFileSync(imagePath, 'base64');

let data = `data:image/${ext};base64, ${imageAsBase64}`;

if (ext === 'svg') {
  data = `data:image/svg+xml;utf8, ${imageAsBase64}`;
}

console.log(`
Usage in CSS variable:
--icon-name: url("${data}");
`);
