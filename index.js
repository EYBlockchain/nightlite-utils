/**
@module nightlite-utils
@author Westlad,Chaitanya-Konda,iAmMichaelConnor
@desc Set of utilities to manipulate variable into forms most liked by
Ethereum and Zokrates
*/
const hashFunctions = require('./hashes');
const numberConversionFunctions = require('./number-conversions');

module.exports = {
  ...hashFunctions,
  ...numberConversionFunctions,
};
