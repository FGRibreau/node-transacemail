var Mailing = require('../');
var path    = require('path');
var _       = require('lodash');
/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['Mailing'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'init': function(t) {
    var mailing = Mailing.compile(path.resolve(__dirname, 'mails1'));
    t.equal(mailing.mails.length, 2);
    t.done();
  },

  '.sendIf': function(t){
    t.expect(3);
    var mails = Mailing.compile(path.resolve(__dirname, 'mails_sendIf'));
    mails.mails = [{
      sendIf: function(a, b, c){
        t.equal(a, true);
        t.deepEqual(b, {hey:['a']});
        t.equal(c, 1);
        return false;
      }
    }];

    mails.sendIf(true, {hey:['a']}, 1);
    t.done();
  },

  '.sendIf should forward the {mail}.sendIf parameters ': function(t){
    t.expect(1);
    var mails = Mailing.compile(path.resolve(__dirname, 'mails_sendIf'));
    mails.mails = [{
      sendIf: function(a, b){
        return _.extend(b, {plop:true});
      },
      _compileWith: function(obj){
        return {
          isAnEmail: true
        };
      }
    }, {sendIf: function(){return false;}}];

    mails.mailProvider = {
      send: function(mail){
        t.ok(mail.isAnEmail);
      }
    };

    mails.sendIf(true, {hey:['a']}, 1);
    t.done();
  },

  '.setProvider': function(t){
    var mailing = Mailing.compile(path.resolve(__dirname, 'mails1'));
    // mailing.setProvider();
    t.done();
  }
};
