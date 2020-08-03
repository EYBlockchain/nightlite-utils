const createKeccakHash = require('keccak');
const config = require('./config');

function addMod(addMe, m) {
  return addMe.reduce((e, acc) => (e + acc) % m, BigInt(0));
}

function powerMod(base, exponent, m) {
  if (m === BigInt(1)) return BigInt(0);
  let result = BigInt(1);
  let b = base % m;
  let e = BigInt(exponent);
  while (e > BigInt(0)) {
    if (e % BigInt(2) === BigInt(1)) result = (result * b) % m;
    e >>= BigInt(1);
    b = (b * b) % m;
  }
  return result;
}

function keccak256Hash(preimage) {
  const h = createKeccakHash('keccak256')
    .update(preimage, 'hex')
    .digest('hex');
  return h;
}

/**
mimc encryption function
@param  {String} x - the input value
@param {String} k - the key value
@param {String} seed - input seed for first round (=0n for a hash)
@param
*/
function mimcp(x, k, seed, roundCount, exponent, m) {
  let xx = x;
  let t;
  let c = seed;
  for (let i = 0; i < roundCount; i++) {
    c = keccak256Hash(c);
    t = addMod([xx, BigInt(`0x${c}`), k], m); // t = x + c_i + k
    xx = powerMod(t, exponent, m); // t^7
  }
  // Result adds key again as blinding factor
  return addMod([xx, k], m);
}

function mimcpMp(x, k, seed, roundCount, exponent, m) {
  let r = k;
  let i;
  for (i = 0; i < x.length; i++) {
    r = (r + (x[i] % m) + mimcp(x[i], r, seed, roundCount, exponent, m)) % m;
  }
  return r;
}

module.exports = function mimcHash(msgs, curve) {
  if (config[curve] === undefined) throw Error('Unknown curve type');
  const { rounds } = config[curve];
  const { exponent } = config[curve];
  const { modulus } = config[curve];
  // elipses means input stored in array called msgs
  const mimc = '6d696d63'; // this is 'mimc' in hex as a nothing-up-my-sleeve seed
  return mimcpMp(
    msgs,
    BigInt(0), // k
    keccak256Hash(mimc), // seed
    rounds, // rounds of hashing
    exponent,
    modulus,
  );
};
