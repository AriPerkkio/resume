window.loadMainContent = loadMainContent;

const query = new URLSearchParams(document.location.search);
const passcodeFromQuery = query.get('passcode');

if (passcodeFromQuery) {
  fetchMainContent(passcodeFromQuery);
}

function loadMainContent(event) {
  event.preventDefault();

  const passcode = document.getElementById('plaintext-passcode').value;
  setStateAndErrors({ errors: '', state: '' });

  fetchMainContent(passcode);
}

function fetchMainContent(passcode) {
  return fetch('./encrypted/main-content.html')
    .then((response) => response.text())
    .then((response) => {
      setStateAndErrors({ errors: '', state: 'Encrypting...' });
      return response;
    })
    .then((encryptedHtml) => decrypt(passcode, encryptedHtml))
    .then(appendToMain)
    .catch((e) => {
      setStateAndErrors({ errors: e.message, state: '' });
      console.error(e);
    });
}

function setStateAndErrors({ errors, state }) {
  const errorElement = document.getElementById('errors');
  const statusElement = document.getElementById('state');

  if (errorElement) {
    errorElement.innerHTML = errors;
  }
  if (statusElement) {
    statusElement.innerHTML = state;
  }
}

function appendToMain(html) {
  if (!/This comment indicates decryption was successful/.test(html)) {
    throw new Error('Invalid passcode');
  }

  document.querySelector('main').innerHTML = html;
}

function decrypt(passcode, encoded) {
  return encoded
    .match(/.{1,2}/g)
    .map((hex) => parseInt(hex, 16))
    .map((char) => applySaltToChar(char, passcode))
    .map((charCode) => String.fromCharCode(charCode))
    .join('');
}

function textToChars(text) {
  return text.split('').map((c) => c.charCodeAt(0));
}

function applySaltToChar(char, passcode) {
  return textToChars(passcode).reduce((a, b) => a ^ b, char);
}
