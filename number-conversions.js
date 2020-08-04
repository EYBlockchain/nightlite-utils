const crypto = require('crypto');
const BI = require('big-integer');

/**
 * Helper function for the converting any base to any base
 */
function parseToDigitsArray(str, base) {
  const digits = str.split('');
  const ary = [];
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    const n = parseInt(digits[i], base);
    if (Number.isNaN(n)) return null;
    ary.push(n);
  }
  return ary;
}

/**
 * Helper function for the converting any base to any base
 */
function add(x, y, base) {
  const z = [];
  const n = Math.max(x.length, y.length);
  let carry = 0;
  let i = 0;
  while (i < n || carry) {
    const xi = i < x.length ? x[i] : 0;
    const yi = i < y.length ? y[i] : 0;
    const zi = carry + xi + yi;
    z.push(zi % base);
    carry = Math.floor(zi / base);
    i += 1;
  }
  return z;
}

/**
 * Helper function for the converting any base to any base
 * Returns a*x, where x is an array of decimal digits and a is an ordinary
 * JavaScript number. base is the number base of the array x.
 */
function multiplyByNumber(num, x, base) {
  if (num < 0) return null;
  if (num === 0) return [];

  let result = [];
  let power = x;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (num & 1) {
      result = add(result, power, base);
    }

    // eslint-disable-next-line no-param-reassign
    num >>= 1;
    if (num === 0) break;
    power = add(power, power, base);
  }
  return result;
}

/**
 * Helper function for the converting any base to any base
 */
function convertBase(str, fromBase, toBase) {
  const digits = parseToDigitsArray(str, fromBase);
  if (digits === null) return null;

  let outArray = [];
  let power = [1];
  for (let i = 0; i < digits.length; i += 1) {
    // invariant: at this point, fromBase^i = power
    if (digits[i]) {
      outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase);
    }
    power = multiplyByNumber(fromBase, power, toBase);
  }

  let out = '';
  for (let i = outArray.length - 1; i >= 0; i -= 1) {
    out += outArray[i].toString(toBase);
  }
  // if the original input was equivalent to zero, then 'out' will still be empty ''. Let's check for zero.
  if (out === '') {
    let sum = 0;
    for (let i = 0; i < digits.length; i += 1) {
      sum += digits[i];
    }
    if (sum === 0) out = '0';
  }

  return out;
}

// FUNCTIONS ON HEX VALUES
/**
 * utility function to remove a leading 0x on a string representing a hex number.
 * If no 0x is present then it returns the string un-altered.
 */
function strip0x(hex) {
  if (typeof hex === 'undefined') return '';
  if (typeof hex === 'string' && hex.indexOf('0x') === 0) {
    return hex.slice(2).toString();
  }
  return hex.toString();
}

function isHex(h) {
  const regexp = /^[0-9a-fA-F]+$/;
  return regexp.test(strip0x(h));
}

function requireHex(value) {
  if (isHex(value) === false) throw new Error('value is not hex');
}

/**
 * utility function to check that a string has a leading 0x (which the Solidity
 * compiler uses to check for a hex string).  It adds it if it's not present. If
 * it is present then it returns the string unaltered
 */
function ensure0x(hex = '') {
  const hexString = hex.toString();
  if (typeof hexString === 'string' && hexString.indexOf('0x') !== 0) {
    return `0x${hexString}`;
  }
  return hexString;
}

/**
 * Utility function to convert a string into a hex representation of fixed length.
 * @param {string} str - the string to be converted
 * @param {int} outLength - the length of the output hex string in bytes (excluding the 0x)
 * if the string is too short to fill the output hex string, it is padded on the left with 0s
 * if the string is too long, an error is thrown
 */
function utf8StringToHex(str, outLengthBytes) {
  const outLength = outLengthBytes * 2; // work in characters rather than bytes
  const buf = Buffer.from(str, 'utf8');
  let hex = buf.toString('hex');
  if (outLength < hex.length)
    throw new Error('String is to long, try increasing the length of the output hex');
  hex = hex.padStart(outLength, '00');
  return ensure0x(hex);
}

function hexToUtf8String(hex) {
  const cleanHex = strip0x(hex).replace(/00/g, '');

  const buf = Buffer.from(cleanHex, 'hex');
  return buf.toString('utf8');
}

/**
 * Utility function to convert a string into a hex representation of fixed length.
 * c@param {string} str - the string to be converted
 * @param {int} outLength - the length of the output hex string in bytes
 * If the string is too short to fill the output hex string, it is padded on the left with 0s.
 * If the string is too long, an error is thrown.
 */
function asciiToHex(str, outLengthBytes) {
  const outLength = outLengthBytes * 2; // work in characters rather than bytes
  const buf = Buffer.from(str, 'ascii');
  let hex = buf.toString('hex');
  if (outLength < hex.length)
    throw new Error('String is to long, try increasing the length of the output hex');
  hex = hex.padStart(outLength, '00');
  return ensure0x(hex);
}

function hexToAscii(hex) {
  const cleanHex = strip0x(hex).replace(/00/g, '');

  const buf = Buffer.from(cleanHex, 'hex');
  return buf.toString('ascii');
}

/**
 * Converts hex strings into binary, so that they can be passed into merkle-proof.code
 * for example (0xff -> [1,1,1,1,1,1,1,1]) 11111111
 */
function hexToBinArray(hex) {
  return parseInt(hex, 16)
    .toString(2)
    .split('');
}

/**
 * The hexToBinary library was giving some funny values with 'undefined' elements within the binary string.
 * Using convertBase seems to be working nicely. THe 'Simple' suffix is to distinguish from hexToBin, which outputs an array of bit elements.
 */
function hexToBin(hex) {
  return convertBase(strip0x(hex), 16, 2);
}

/**
 * Converts hex strings into byte (decimal) values.  This is so that they can
 * be passed into  merkle-proof.code in a more compressed fromat than bits.
 * Each byte is invididually converted so 0xffff becomes [15,15]
 */
function hexToBytes(hex) {
  const cleanHex = strip0x(hex);
  const out = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    const h = ensure0x(cleanHex[i] + cleanHex[i + 1]);
    out.push(parseInt(h, 10).toString());
  }
  return out;
}

/**
 * Converts hex strings to decimal values
 */
function hexToDec(hexStr) {
  if (hexStr.substring(0, 2) === '0x') {
    return convertBase(hexStr.substring(2).toLowerCase(), 16, 10);
  }
  return convertBase(hexStr.toLowerCase(), 16, 10);
}

/**
 * converts a hex string to an element of a Finite Field GF(fieldSize) (note, decimal representation is used for all field elements)
 * @param {string} hexStr A hex string.
 * @param {integer} fieldSize The number of elements in the finite field.
 * @return {string} A Field Value (decimal value) (formatted as string, because they're very large)
 */
function hexToField(hexStr, fieldSize) {
  const cleanHexStr = strip0x(hexStr);
  const decStr = hexToDec(cleanHexStr);
  return (BigInt(decStr) % BigInt(fieldSize)).toString();
}

/**
 * Left-pads the input hex string with zeros, so that it becomes of size N octets.
 * @param {string} hexStr A hex number/string.
 * @param {integer} N The string length (i.e. the number of octets).
 * @return A hex string (padded) to size N octets, (plus 0x at the start).
 */
function leftPadHex(hexStr, n) {
  return ensure0x(strip0x(hexStr).padStart(n, '0'));
}

/**
Truncates the input hex string with zeros, so that it becomes of size N octets.
@param {string} hexStr A hex number/string.
@param {integer} N The string length (i.e. the number of octets).
@return A hex string (truncated) to size N octets, (plus 0x at the start).
*/
function truncateHex(hexStr, n) {
  const len = strip0x(hexStr).length;
  if (len <= n) return ensure0x(hexStr); // it's already truncated
  return ensure0x(strip0x(hexStr).substring(len - n));
}

/**
Resizes input hex string: either left-pads with zeros or left-truncates, so that it becomes of size N octets.
@param {string} hexStr A hex number/string.
@param {integer} N The string length (i.e. the number of octets).
@return A hex string of size N octets, (plus 0x at the start).
*/
function resizeHex(hexStr, n) {
  const len = strip0x(hexStr).length;
  if (len > n) return truncateHex(hexStr, n);
  if (len < n) return leftPadHex(hexStr, n);
  return ensure0x(hexStr);
}

/**
 * Used by split'X'ToBitsN functions.
 * Checks whether a binary number is larger than N bits,
 * and splits its binary representation into chunks of size = N bits.
 * The left-most (big endian) chunk will be the only chunk of size <= N bits.
 * If the inequality is strict, it left-pads this left-most chunk with zeros.
 * @param {string} bitStr A binary number/string.
 * @param {integer} limbBitLength The 'chunk size'.
 * @return An array whose elements are binary 'chunks' which altogether represent the input binary number.
 */
function binToLimbs(bitStr, limbBitLength) {
  let a = [];
  const len = bitStr.length;
  if (len <= limbBitLength) {
    return [bitStr.toString().padStart(limbBitLength, 0)];
  }
  const nStr = bitStr.slice(-limbBitLength); // the rightmost limbBitLength bits
  const remainderStr = bitStr.slice(0, len - limbBitLength); // the remaining rightmost bits

  a = [...binToLimbs(remainderStr, limbBitLength), nStr, ...a];

  return a;
}

/**
 * Checks whether a hex number is larger than N bits,
 * and splits its binary representation into chunks of size = N bits.
 * The left-most (big endian) chunk will be the only chunk of size <= N bits.
 * If the inequality is strict, it left-pads this left-most chunk with zeros.
 * @param {string} hexStr A hex number/string.
 * @param {integer} limbBitLength The 'chunk size'.
 * @return An array whose elements are binary 'chunks' which altogether represent the input hex number.
 */
function hexToBinLimbs(hexStr, limbBitLength) {
  const strippedHexStr = strip0x(hexStr);
  const bitStr = hexToBin(strippedHexStr.toString());
  let a = [];
  a = binToLimbs(bitStr, limbBitLength);
  return a;
}

/**
 * Converts binary value strings to hex values
 */
function binToHex(binStr) {
  const hex = convertBase(binStr, 2, 16);
  return hex ? `0x${hex}` : null;
}

// FUNCTIONS ON DECIMAL VALUES
/**
 * Converts decimal value strings to hex values
 */
function decToHex(decStr) {
  const hex = convertBase(decStr, 10, 16);
  return hex ? `0x${hex}` : null;
}

/**
 * Converts decimal value strings to binary values
 */
function decToBin(decStr) {
  return convertBase(decStr, 10, 2);
}

/**
 * Converts binary value strings to decimal values
 */
function binToDec(binStr) {
  const dec = convertBase(binStr, 2, 10);
  return dec;
}

/**
 * Preserves the magnitude of a hex number in a finite field, even if the order of the field is smaller than hexStr.
 * hexStr is converted to decimal (as fields work in decimal integer representation) and then split into chunks of size packingSize.
 * Relies on a sensible packing size being provided (ZoKrates uses packingSize = 128).
 * if the result has fewer elements than it would need for compatibiity with the dsl, it's padded to the left with zero elements
 */
function hexToFieldLimbs(hexStr, limbBitLength, numberOfLimbs, silenceWarnings) {
  requireHex(hexStr);

  let bitsArr = [];
  bitsArr = hexToBinLimbs(hexStr, limbBitLength.toString());

  let decArr = []; // decimal array
  decArr = bitsArr.map(item => binToDec(item.toString()));

  // fit the output array to the desired number of numberOfLimbs:
  if (numberOfLimbs !== undefined) {
    if (numberOfLimbs < decArr.length) {
      const overflow = decArr.length - numberOfLimbs;
      if (!silenceWarnings)
        throw new Error(
          `Field split into an array of ${decArr.length} limbs: ${decArr}
          , but this exceeds the requested packet size of ${numberOfLimbs}. Data would have been lost; possibly unexpectedly. To silence this warning, pass '1' or 'true' as the final parameter.`,
        );
      // remove extra limbs (dangerous!):
      for (let i = 0; i < overflow; i += 1) decArr.shift();
    } else {
      const missing = numberOfLimbs - decArr.length;
      // add any missing zero elements
      for (let i = 0; i < missing; i += 1) decArr.unshift('0');
    }
  }
  return decArr;
}

/**
 * function to generate a promise that resolves to a string of hex
 * @param {int} bytes - the number of bytes of hex that should be returned
 * @param {int} max - optional parameter to set a maximum value
 */
function randomHex(bytes, max) {
  if (max !== undefined && (Buffer.byteLength(decToHex(max.toString()), 'utf8') - 2) / 2 < bytes) {
    throw new Error(`Number smaller than ${bytes} bytes passed as maximum`);
  }
  return new Promise((resolve, reject) => {
    crypto.randomBytes(bytes, (err, buf) => {
      if (err) reject(err);
      if (hexToDec(buf.toString('hex')) > max) {
        randomHex(bytes, max);
      } else {
        resolve(`0x${buf.toString('hex')}`);
      }
    });
  });
}

/**
 * Checks whether a decimal integer is larger than N bits,
 * and splits its binary representation into chunks of size = N bits.
 * The left-most (big endian) chunk will be the only chunk of size <= N bits.
 * If the inequality is strict, it left-pads this left-most chunk with zeros.
 * @param {string} decStr A decimal number/string.
 * @param {integer} limbBitLength The 'chunk size'.
 * @return An array whose elements are binary 'chunks' which altogether represent the input decimal number.
 */
function decToBinLimbs(decStr, limbBitLength) {
  const bitStr = decToBin(decStr.toString());
  let a = [];
  a = binToLimbs(bitStr, limbBitLength);
  return a;
}

/**
 * Converts an array of Field Elements (decimal numbers which are smaller in magnitude than the field size q), where the array represents a decimal of magnitude larger than q, into the decimal which the array represents.
 * @param {[string]} fieldsArr is an array of (decimal represented) field elements. Each element represents a number which is 2**128 times larger than the next in the array. So the 0th element of fieldsArr requires the largest left-shift (by a multiple of 2**128), and the last element is not shifted (shift = 1). The shifted elements should combine (sum) to the underlying decimal number which they represent.
 * @param {integer} packingSize Each field element of fieldsArr is a 'packing' of exactly 'packingSize' bits. I.e. packingSize is the size (in bits) of each chunk (element) of fieldsArr. We use this to reconstruct the underlying decimal value which was, at some point previously, packed into a fieldsArr format.
 * @returns {string} A decimal number (as a string, because it might be a very large number)
 */
function fieldsToDec(fieldsArr, packingSize) {
  const len = fieldsArr.length;
  let acc = BigInt('0');
  const s = [];
  const t = [];
  const shift = [];
  const exp = new BI(2).pow(packingSize);
  for (let i = 0; i < len; i += 1) {
    s[i] = new BI(fieldsArr[i].toString());
    shift[i] = new BI(exp).pow(len - 1 - i); // binary shift of the ith field element
    t[i] = BigInt('0');
    t[i] = s[i].multiply(shift[i]);
    acc = acc.add(t[i]);
  }
  const decStr = acc.toString();
  return decStr;
}

/**
 * flattenArray converts a nested array into a flattened array. We use this to pass our proofs and vks into the verifier contract.
 * Example:
 * A vk of the form:
 * [
 *   [
 *     [ '1','2' ],
 *     [ '3','4' ]
 *   ],
 *   [ '5','6' ],
 *   [
 *     [ '7','8' ], [ '9','10' ]
 *   ],
 * [
 *   [ '11','12' ],
 *   [ '13','14' ]
 * ],
 * [ '15','16' ],
 * [
 *   [ '17','18' ], [ '19','20' ]
 * ],
 * [
 *   [ '21','22' ],
 *   [ '23','24' ]
 * ],
 * [
 *   [ '25','26' ],
 *   [ '27','28' ],
 *   [ '29','30' ],
 *   [ '31','32' ]
 * ]
 * is converted to:
 * ['1','2','3','4','5','6',...]
 */
function flattenArray(arr) {
  return arr.reduce(
    (acc, val) => (Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val)),
    [],
  );
}

module.exports = {
  parseToDigitsArray,
  add,
  multiplyByNumber,
  convertBase,
  strip0x,
  isHex,
  requireHex,
  randomHex,
  ensure0x,
  utf8StringToHex,
  hexToUtf8String,
  asciiToHex,
  hexToAscii,
  hexToBinArray,
  hexToBin,
  hexToBytes,
  hexToDec,
  hexToField,
  leftPadHex,
  truncateHex,
  resizeHex,
  binToLimbs,
  hexToBinLimbs,
  binToHex,
  hexToFieldLimbs,
  decToHex,
  decToBin,
  binToDec,
  decToBinLimbs,
  fieldsToDec,
  flattenArray,
};
