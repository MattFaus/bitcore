'use strict';

var chai = chai || require('chai');
chai.Assertion.includeStack = true;
var bitcore = bitcore || require('../bitcore');

var should = chai.should();

var TransactionModule = bitcore.Transaction;
var Transaction;
var In;
var Out;
var Script = bitcore.Script;
var buffertools = require('buffertools');
var testdata = testdata || require('./testdata');

// Read tests from test/data/tx_valid.json and tx_invalid.json
// Format is an array of arrays
// Inner arrays are either [ "comment" ]
// or [[[prevout hash, prevout index, prevout scriptPubKey], [input 2], ...],"], serializedTransaction, enforceP2SH
// ... where all scripts are stringified scripts.
// Returns an object with the Transaction object, and an array of input objects
function parse_test_transaction(entry) {
  // Ignore comments
  if (entry.length !== 3) return;

  var inputs = [];
  entry[0].forEach(function(vin) {
    var hash = vin[0];
    var index = vin[1];
    var scriptPubKey = Script.fromHumanReadable(vin[2]);

    inputs.push({
      'prev_tx_hash': hash,
      'index': index,
      'scriptPubKey': scriptPubKey
    });

    console.log(scriptPubKey.toHumanReadable());
    console.log('********************************');
  });

  var raw = new Buffer(entry[1], 'hex');
  var tx = new TransactionModule();
  tx.parse(raw);

  // Sanity check transaction has been parsed correctly
  buffertools.toHex(tx.serialize()).should.equal(buffertools.toHex(raw));
  return {
    'transaction': tx,
    'inputs': inputs
  };
}

describe('Transaction', function() {
  it('should initialze the main object', function() {
    should.exist(TransactionModule);
  });
  it('should be able to create class', function() {
    Transaction = TransactionModule;
    should.exist(Transaction);
    In = Transaction.In;
    Out = Transaction.Out;
    should.exist(In);
    should.exist(Out);
  });
  it('should be able to create instance', function() {
    var t = new Transaction();
    should.exist(t);
  });

  // Verify that known valid transactions are intepretted correctly
  testdata.dataTxValid.forEach(function(datum) {
    var testTx = parse_test_transaction(datum);
    if (!testTx) return;
    var transactionString = buffertools.toHex(
      testTx.transaction.serialize());

    it('valid tx=' + transactionString, function() {
      // Verify that all inputs are valid
      testTx.inputs.forEach(function(input) {
        testTx.transaction.verifyInput(input.index, input.scriptPubKey,
          function(err, results) {
            // Exceptions raised inside this function will be handled
            // ...by this function, so ignore if that is the case
            if (err && err.constructor.name === "AssertionError") return;

            should.not.exist(err);
            should.exist(results);
            results.should.equal(true);
          });
      });
    });
  });

  // Verify that known invalid transactions are interpretted correctly
  test_data.dataTxInvalid.forEach(function(datum) {
    var testTx = parse_test_transaction(datum);
    if (!testTx) return;
    var transactionString = buffertools.toHex(
      testTx.transaction.serialize());

    it('valid tx=' + transactionString, function() {
      // Verify that all inputs are invalid
      testTx.inputs.forEach(function(input) {
        testTx.transaction.verifyInput(input.index, input.scriptPubKey,
          function(err, results) {
            // Exceptions raised inside this function will be handled
            // ...by this function, so ignore if that is the case
            if (err && err.constructor.name === "AssertionError") return;

            should.exist(err);
          });
      });
    });
  });
});
