import * as fs from 'fs';
import { getArgument } from './utils.mjs';

const passcodeArg = getArgument('--passcode');
const mainContent = fs.readFileSync('src/gitignore/main-content.html', 'utf8');
const encrypted = encrypt(passcodeArg, mainContent);

fs.writeFileSync('src/encrypted/main-content.html', encrypted, 'utf8');
console.log('Updated src/encrypted/main-content.html');

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
