const { convertBase } = require('./convert-base');
const { binToLimbs } = require('./binary');

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

module.exports = {
  decToHex,
  decToBin,
  decToBinLimbs,
};
