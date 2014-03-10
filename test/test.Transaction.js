'use strict';

var chai = chai || require('chai');
var bitcore = bitcore || require('../bitcore');

var should = chai.should();

var TransactionModule = bitcore.Transaction;
var Transaction;
var In;
var Out;
var Script = bitcore.Script;
var buffertools = require('buffertools');
var test_data = require('./testdata');

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

  // Read tests from test/data/tx_valid.json
  // Format is an array of arrays
  // Inner arrays are either [ "comment" ]
  // or [[[prevout hash, prevout index, prevout scriptPubKey], [input 2], ...],"], serializedTransaction, enforceP2SH
  // ... where all scripts are stringified scripts.
  test_data.dataTxValid.forEach(function(datum) {
    if (datum.length === 3) {
      it('valid tx=' + datum[1], function() {
        var inputs = datum[0];
        var inputScriptPubKeys = [];
        inputs.forEach(function(vin) {
          var hash = vin[0];
          var index = vin[1];
          var scriptPubKey = new Script(new Buffer(vin[2]));
          inputScriptPubKeys.push(scriptPubKey);
          console.log(scriptPubKey.getStringContent());
          console.log('********************************');

        });
        var raw = new Buffer(datum[1], 'hex');
        var tx = new Transaction();
        tx.parse(raw);

        buffertools.toHex(tx.serialize()).should.equal(buffertools.toHex(raw));

        var n = 0;
        inputScriptPubKeys.forEach(function(scriptPubKey) {
          tx.verifyInput(0, scriptPubKey, function(err, results) {
            should.not.exist(err);
            should.exist(results);
            results.should.equal(true);
          });
          n += 1;
        });

        // TODO(mattfaus): Other verifications?
      });
    }
  });
});
