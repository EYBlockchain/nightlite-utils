const crypto = require('crypto');

const { strip0x } = require('../../number-conversions');

/**
 * Utility function to concatenate two hex strings and return as buffer
 * Looks like the inputs are somehow being changed to decimal!
 */
function concatenate(a, b) {
  const length = a.length + b.length;
  const buffer = Buffer.allocUnsafe(length); // creates a buffer object of length 'length'
  for (let i = 0; i < a.length; i += 1) {
    buffer[i] = a[i];
  }
  for (let j = 0; j < b.length; j += 1) {
    buffer[a.length + j] = b[j];
  }
  return buffer;
}

module.exports = function shaHash(...items) {
  const concatvalue = items
    .map(item => Buffer.from(strip0x(item), 'hex'))
    .reduce((acc, item) => concatenate(acc, item));

  const h = `0x${crypto
    .createHash('sha256')
    .update(concatvalue, 'hex')
    .digest('hex')}`;
  return h;
};
