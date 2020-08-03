/**
@module utils.js
@author Westlad,Chaitanya-Konda,iAmMichaelConnor
@desc Set of utilities to manipulate variable into forms most liked by
Ethereum and Zokrates
*/

const logger = require('./logger');
const hashFunctions = require('./hashes');
const numberConversionFunctions = require('./number-conversions');

function gasUsedStats(txReceipt, functionName) {
  logger.debug(`\nGas used in ${functionName}:`);
  const { gasUsed } = txReceipt.receipt;
  const gasUsedLog = txReceipt.logs.filter(log => {
    return log.event === 'GasUsed';
  });
  const gasUsedByShieldContract = Number(gasUsedLog[0].args.byShieldContract.toString());
  const gasUsedByVerifierContract = Number(gasUsedLog[0].args.byVerifierContract.toString());
  const refund = gasUsedByVerifierContract + gasUsedByShieldContract - gasUsed;
  logger.debug('Total:', gasUsed);
  logger.debug('By shield contract:', gasUsedByShieldContract);
  logger.debug('By verifier contract (pre refund):', gasUsedByVerifierContract);
  logger.debug('Refund:', refund);
  logger.debug('Attributing all of refund to the verifier contract...');
  logger.debug('By verifier contract (post refund):', gasUsedByVerifierContract - refund);
}

module.exports = {
  ...hashFunctions,
  ...numberConversionFunctions,
  gasUsedStats,
};
