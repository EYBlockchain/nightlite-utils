const { convertBase } = require('./convert-base');

/**
 * Converts binary value strings to hex values
 */
function binToHex(binStr) {
  const hex = convertBase(binStr, 2, 16);
  return hex ? `0x${hex}` : null;
}

/**
 * Converts binary value strings to decimal values
 */
function binToDec(binStr) {
  const dec = convertBase(binStr, 2, 10);
  return dec;
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

module.exports = {
  binToHex,
  binToDec,
  binToLimbs,
};
