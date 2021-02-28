const crypto = require('crypto');
const BI = require('big-integer');
const { convertBase } = require('./convert-base');
const { binToHex, binToLimbs } = require('./binary');

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

function isHex(value) {
  if (typeof value !== 'string') return false;
  if (value.indexOf('0x') !== 0) return false;
  const regexp = /^[0-9a-fA-F]+$/;
  return regexp.test(strip0x(value));
}

// Same as `isHex`, but throws errors.
function requireHex(value) {
  if (typeof value !== 'string') throw new Error(`value ${value} is not a string`);
  if (value.indexOf('0x') !== 0) throw new Error(`value ${value} missing 0x prefix`);
  const regexp = /^[0-9a-fA-F]+$/;
  if (!regexp.test(strip0x(value))) throw new Error(`value ${value} is not hex`);
}

function ensure0x(hex = '') {
  const hexString = hex.toString();
  if (hexString.indexOf('0x') !== 0) {
    return `0x${hexString}`;
  }
  requireHex(hexString);
  return hexString;
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

function hexToUtf8(hex) {
  const cleanHex = strip0x(hex).replace(/00/g, '');

  const buf = Buffer.from(cleanHex, 'hex');
  return buf.toString('utf8');
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
  return hexToBin(hex).split('')
}

/**
 * The hexToBinary library was giving some funny values with 'undefined' elements within the binary string.
 * Using convertBase seems to be working nicely.
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
  return convertBase(strip0x(hexStr).toLowerCase(), 16, 10);
}

/** converts a hex string to an element of a Finite Field GF(fieldSize) (note, decimal representation is used for all field elements)
@param {string} hexStr A hex string.
@param {integer} modulus The modulus of the finite field.
@return {string} A Field Value (decimal value) (formatted as string, because they're very large)
*/
function hexToField(hex, modulus, noOverflow) {
  const dec = BI(hexToDec(hex));
  const q = BI(modulus);
  if (noOverflow && dec > q) throw new Error('field modulus overflow');
  return dec.mod(q).toString();
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

function hexToLimbs(hexStr, limbBitLength, numberOfLimbs, throwErrors) {
  requireHex(hexStr);

  // we first convert to binary, so that we can split into limbs of specific bit-lengths:
  let binArr = [];
  binArr = hexToBinLimbs(hexStr, limbBitLength);

  // then we convert each limb into a hexadecimal:
  let hexArr = [];
  hexArr = binArr.map(item => binToHex(item.toString()));

  // If specified, fit the output array to the desired numberOfLimbs:
  if (numberOfLimbs !== undefined) {
    if (numberOfLimbs < hexArr.length) {
      const overflow = hexArr.length - numberOfLimbs;
      if (throwErrors)
        throw new Error(
          `Hex value ${hexStr} split into an array of ${hexArr.length} limbs: ${hexArr}, but this exceeds the requested number of limbs of ${numberOfLimbs}. Data would have been lost; possibly unexpectedly. To silence this warning, pass '1' or 'true' as the final parameter.`,
        );
      // remove extra limbs (dangerous!):
      for (let i = 0; i < overflow; i += 1) hexArr.shift();
    } else {
      const missing = numberOfLimbs - hexArr.length;
      // if the number of limbs required is greater than the number so-far created, prefix any missing limbs to the array as '0x0' elements.
      for (let i = 0; i < missing; i += 1) hexArr.unshift('0x0');
    }
  }
  return hexArr;
}

function hexToDecLimbs(hexStr, limbBitLength, numberOfLimbs, throwErrors) {
  const hexArr = hexToLimbs(hexStr, limbBitLength, numberOfLimbs, throwErrors);
  const decArr = hexArr.map(hexToDec);
  return decArr;
}

/**
function to generate a promise that resolves to a string of hex
@param {int} bytes - the number of bytes of hex that should be returned
*/
function randomHex(bytes) {
  const buf = crypto.randomBytes(bytes);
  return `0x${buf.toString('hex')}`;
}

module.exports = {
  strip0x,
  ensure0x,
  isHex,
  requireHex,
  leftPadHex,
  truncateHex,
  resizeHex,
  hexToUtf8,
  hexToAscii,
  hexToBinArray,
  hexToBin,
  hexToBytes,
  hexToDec,
  hexToField,
  hexToLimbs,
  hexToDecLimbs,
  hexToBinLimbs,
  randomHex,
};
