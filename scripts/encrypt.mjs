import * as fs from 'fs';
import { compressToBase64, getArgument } from './utils.mjs';

const passcodeArg = getArgument('--passcode');
const mainContent = fs.readFileSync('gitignore/main-content.html', 'utf8');

console.log('Encrypting...');
const encrypted = encrypt(passcodeArg, mainContent);

console.log('Compressing...');
const compressed = compressToBase64(encrypted);

console.log('\nSizes in character counts:');
console.log(`Raw:        ${mainContent.length}`);
console.log(`Encrypted:  ${encrypted.length}`);
console.log(`Compressed: ${compressed.length}`);

fs.writeFileSync('src/encrypted/main-content.html', compressed, 'utf8');
console.log('\nUpdated src/encrypted/main-content.html');

function encrypt(passcode, text) {
  return text
    .split('')
    .map(textToChars)
    .map((char) => applySaltToChar(char, passcode))
    .map(byteToHex)
    .join('');
}

function textToChars(text) {
  return text.split('').map((c) => c.charCodeAt(0));
}

function byteToHex(byte) {
  return ('0' + Number(byte).toString(16)).slice(-2);
}

function applySaltToChar(char, passcode) {
  return textToChars(passcode).reduce((a, b) => a ^ b, char);
}
