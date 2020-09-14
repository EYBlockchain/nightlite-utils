const { ensure0x } = require('./hex.js');

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

module.exports = {
  utf8StringToHex,
  asciiToHex,
};
