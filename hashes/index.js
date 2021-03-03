const mimcHash = require('./mimc');
const shaHash = require('./sha256');
const poseidonHash = require('./poseidon');

module.exports = {
  shaHash,
  mimcHash,
  poseidonHash,
};
