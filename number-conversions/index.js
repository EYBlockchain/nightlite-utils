const convertBase = require('./convert-base');
const binaryConversions = require('./binary');
const decimalConversions = require('./decimal');
const hexConversions = require('./hex');
const charConversions = require('./char');

module.exports = {
  ...convertBase,
  ...binaryConversions,
  ...decimalConversions,
  ...hexConversions,
  ...charConversions,
};
