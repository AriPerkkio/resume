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
      return sleep(response, 200);
    })
    .then(decompressFromBase64)
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

function sleep(input, ms) {
  return new Promise((resolve) => setTimeout(() => resolve(input), ms));
}

/**
 * From https://github.com/pieroxy/lz-string/blob/master/libs/lz-string.js
 * with the awesome license of http://www.wtfpl.net/.
 * There are some small modifications here and there.
 */
function decompressFromBase64(input) {
  if (input == null) return '';
  if (input == '') return null;

  var keyStrBase64 =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var baseReverseDic = {};

  function getBaseValue(alphabet, character) {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (var i = 0; i < alphabet.length; i++) {
        baseReverseDic[alphabet][alphabet.charAt(i)] = i;
      }
    }
    return baseReverseDic[alphabet][character];
  }

  function decompress(length, resetValue, getNextValue) {
    var dictionary = [],
      next,
      enlargeIn = 4,
      dictSize = 4,
      numBits = 3,
      entry = '',
      result = [],
      i,
      w,
      bits,
      resb,
      maxpower,
      power,
      c,
      data = { val: getNextValue(0), position: resetValue, index: 1 };

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2, 2);
    power = 1;
    while (power != maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }

    // eslint-disable-next-line no-unused-vars
    switch ((next = bits)) {
      case 0:
        bits = 0;
        maxpower = Math.pow(2, 8);
        power = 1;
        while (power != maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position == 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        c = String.fromCharCode(bits);
        break;
      case 1:
        bits = 0;
        maxpower = Math.pow(2, 16);
        power = 1;
        while (power != maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position == 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        c = String.fromCharCode(bits);
        break;
      case 2:
        return '';
    }
    dictionary[3] = c;
    w = c;
    result.push(c);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (data.index > length) {
        return '';
      }

      bits = 0;
      maxpower = Math.pow(2, numBits);
      power = 1;
      while (power != maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch ((c = bits)) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2, 8);
          power = 1;
          while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = String.fromCharCode(bits);
          c = dictSize - 1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2, 16);
          power = 1;
          while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = String.fromCharCode(bits);
          c = dictSize - 1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
    }
  }

  return decompress(input.length, 32, function (index) {
    return getBaseValue(keyStrBase64, input.charAt(index));
  });
}
