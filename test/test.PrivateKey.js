'use strict';

var chai = chai || require('chai');
var bitcore = bitcore || require('../bitcore');

var should = chai.should();

var PrivateKeyModule = bitcore.PrivateKey;
var PrivateKey;

var networks = bitcore.networks;

describe('PrivateKey', function() {
  it('should initialze the main object', function() {
    should.exist(PrivateKeyModule);
  });
  it('should be able to create class', function() {
    PrivateKey = PrivateKeyModule;
    should.exist(PrivateKey);
  });
  it('should be able to create instance', function() {
    var pk = new PrivateKey();
    should.exist(pk);
  });
  it('should convert hex testnet private key with compressed public key to base58check format', function() {
    var hex = 'b9f4892c9e8282028fea1d2667c4dc5213564d41fc5783896a0d843fc15089f3';
    var buf = new Buffer(hex, 'hex');
    var privkey = new PrivateKey(networks.testnet.keySecret, buf, true);

    privkey.as('base58').should.equal('cTpB4YiyKiBcPxnefsDpbnDxFDffjqJob8wGCEDXxgQ7zQoMXJdH');
  });
  it('should convert base58 testnet private key to compressed public key to base58check format', function() {
    var base58 = 'cPC4YSFiHHqbUCmWyh4u1bv1Bz5iTNZqQJUMPFt2uMVPtwFFE1Fj';
    var privkey = new PrivateKey(base58);

    privkey.as('base58').should.equal('cTpB4YiyKiBcPxnefsDpbnDxFDffjqJob8wGCEDXxgQ7zQoMXJdH');
  });
});
