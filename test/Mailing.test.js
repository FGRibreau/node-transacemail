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
      sendIf: function(a, b, c, fn){
        t.equal(a, true);
        t.deepEqual(b, {hey:['a']});
        t.equal(c, 1);
        return fn(false);
      }
    }];
    mails.sendIf(true, {hey:['a']}, 1).fin(t.done.bind(t));
  },

  '.sendIf should forward the {mail}.sendIf parameters ': function(t){
    t.expect(1);
    var mails = Mailing.compile(path.resolve(__dirname, 'mails_sendIf'));
    mails.mails = [{
      sendIf: function(a, b, c, fn){
        fn(_.extend(b, {plop:true}));
      },
      _compileWith: function(obj){
        return {
          isAnEmail: true
        };
      }
    }, {sendIf: function(a, b, c,fn){return fn(false);}}];

    mails.setMailProvider({
      send: function(mail, fn){
        t.ok(mail.isAnEmail);
        fn();
      }
    });

    mails.sendIf(true, {hey:['a']}, 1);
    t.done();
  },

  '.setProvider': function(t){
    var mailing = Mailing.compile(path.resolve(__dirname, 'mails1'));
    // mailing.setProvider();
    t.done();
  },

  '_sendThroughProvider should not be called if sendIf returned nothing': function(t){
    t.expect(4);
    var mailing = Mailing.compile(path.resolve(__dirname, 'mails1'));
    mailing._sendThroughProvider(function(a, b){
      t.strictEqual(a, undefined);
      t.strictEqual(b, undefined);
    }, {}, false);
    mailing._sendThroughProvider(function(a, b){
      t.strictEqual(a, undefined);
      t.strictEqual(b, undefined);
    }, {});
    t.done();
  },

  '_sendThroughProvider should call mail._compileWith & provider.send': function(t){
    t.expect(4);
    var mailing = Mailing.compile(path.resolve(__dirname, 'mails1'));
    var mail = Mailing.Mail.Factory(Mailing.templateEngine, path.resolve(__dirname, 'mails1/j0_thanks.meta.js'));

    mailing.setMailProvider({
      send: function(mail, fn){
        t.deepEqual(mail.mandrill, { message: { subject: 'Thank you !',from_email: 'plop@plop.com',from_name: 'Mr Plop' } });
        t.equal(mail.html, '<div style=\"background-color: #ff00ff; color: #0000ff;\">ploop</div>\n<div style=\"background-color: #ff00ff; color: #0000ff;\">Awesome.</div>\n');
        t.deepEqual(mail.data, {heyOh:"heyOh",Hey: "ploop"}, "");
        fn();
      }
    });

    mailing._sendThroughProvider(function(){
      t.ok(true);
      t.done();
    }, mail, {
      heyOh:"heyOh",
      Hey: "ploop"
    });
  },

  '.setMailProvider': function(t){
    t.expect(4);
    var mailing = Mailing.compile(path.resolve(__dirname, 'mails1'));
    t.throws(function(){
      mailing.setMailProvider();
    });

    t.throws(function(){
      mailing.setMailProvider({});
    });

    t.throws(function(){
      mailing.setMailProvider({send: function(){}});
    });

    t.deepEqual(mailing.setMailProvider({send: function(mail, fn){}}), mailing);
    t.done();
  },

  '.setTemplateEngine': function(t){
    var mailing = Mailing.compile(path.resolve(__dirname, 'mails1'));
    t.throws(function(){
      mailing.setTemplateEngine();
    });

    t.throws(function(){
      mailing.setTemplateEngine({});
    });

    t.throws(function(){
      mailing.setTemplateEngine({compile: function(){}, exec: function(){}});
    });

    t.throws(function(){
      mailing.setTemplateEngine({compile: function(template){}, exec: function(fnCompiledTemplate){}});
    });

    t.deepEqual(mailing.setTemplateEngine({compile: function(template){}, exec: function(fnCompiledTemplate, data){}}), mailing);
    t.done();
  }
};
