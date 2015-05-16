var Mailing = require('../');
var Mail = Mailing.Mail;
var path = require('path');
var _ = require('lodash');

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

exports['Mail'] = {
  setUp: function (done) {
    // setup here
    done();
  },

  '.parsePath': function (t) {
    t.expect(2);
    var mail = new Mail(Mailing.templateEngine, path.resolve('/a/b/c/fixtures/emptyMeta.meta.js'));
    t.equal(mail._dir, "/a/b/c/fixtures");
    t.equal(mail._name, "emptyMeta");
    t.done();
  },

  '._readMeta (without sendIf function)': function (t) {
    t.expect(3);
    var mail = new Mail(Mailing.templateEngine, path.resolve(__dirname, 'fixtures/emptyMeta.meta.js'))._readMeta();
    t.deepEqual(mail.styles, []);
    t.ok(_.isFunction(mail.sendIf));
    mail.sendIf(function (ret) {
      t.ok(!ret);
    });
    t.done();
  },

  'getMailing': function (t) {
    var mail = new Mail(Mailing.templateEngine, path.resolve(__dirname, 'mails1/j0_thanks.meta.js'))._readMeta();
    t.strictEqual(mail.getMailing(), null);
    t.done();
  },

  '._readMeta': function (t) {
    t.expect(2);
    var mail = new Mail(Mailing.templateEngine, path.resolve(__dirname, 'mails1/j0_thanks.meta.js'))._readMeta();
    t.deepEqual(mail.styles, ['./css/global.css']);
    t.ok(_.isFunction(mail.sendIf));
    t.done();
  },

  '._readHTML (not found)': function (t) {
    var mail = new Mail(Mailing.templateEngine, path.resolve(__dirname, 'mails_withoutHTML/j0_thanks.meta.js'));
    t.deepEqual(mail._readHTML(), mail, "chainable");
    t.strictEqual(mail.html, null);
    t.done();
  },

  '._readHTML (found)': function (t) {
    var mail = new Mail(Mailing.templateEngine, path.resolve(__dirname, 'mails1/j1_hey.meta.js'));
    t.deepEqual(mail._readHTML(), mail, "chainable");
    t.strictEqual(mail.html, "<div>Plop {{ Hey }}</div>\n<div>Awesome !!</div>\n");
    t.done();
  },

  '._readText (not found)': function (t) {
    var mail = new Mail(Mailing.templateEngine, path.resolve(__dirname, 'mails_withoutText/j0_thanks.meta.js'));
    t.deepEqual(mail._readText(), mail, "chainable");
    t.strictEqual(mail.text, null);
    t.done();
  },

  '._readText (found)': function (t) {
    var mail = new Mail(Mailing.templateEngine, path.resolve(__dirname, 'mails1/j1_hey.meta.js'));
    t.deepEqual(mail._readText(), mail, "chainable");
    t.strictEqual(mail.text, "Hello Text\n\nPlop");
    t.done();
  },

  '._mergeCss (without css)': function (t) {
    var mail = new Mail(Mailing.templateEngine, path.resolve(__dirname, 'mails1/j0_thanks.meta.js'))._readMeta();
    mail.styles = [];
    t.deepEqual(mail._readHTML()._mergeCss(), mail, "chainable");
    t.strictEqual(mail.html, "<div>{{ Hey }}</div>\n<div>Awesome.</div>\n");
    t.done();
  },

  '._mergeCss (with one css)': function (t) {
    var mail = new Mail(Mailing.templateEngine, path.resolve(__dirname, 'mails1/j0_thanks.meta.js'))._readMeta();
    t.deepEqual(mail.styles, ['./css/global.css']);
    t.deepEqual(mail._readHTML()._mergeCss(), mail, "chainable");
    t.strictEqual(mail.html, "<div style=\"background-color: #ff00ff;\">{{ Hey }}</div>\n<div style=\"background-color: #ff00ff;\">Awesome.</div>\n");
    t.done();
  },

  '._mergeCss (with multiple css)': function (t) {
    var mail = new Mail(Mailing.templateEngine, path.resolve(__dirname, 'mails1/j1_hey.meta.js'))._readMeta();
    t.deepEqual(mail.styles, ['./css/global.css', './css/extra.css']);
    t.deepEqual(mail._readHTML()._mergeCss(), mail, "chainable");
    t.strictEqual(mail.html, "<div style=\"background-color: #ff00ff; color: #0000ff;\">Plop {{ Hey }}</div>\n<div style=\"background-color: #ff00ff; color: #0000ff;\">Awesome !!</div>\n");
    t.done();
  },

  '._compileWith (default template engine)': function (t) {
    var mail = Mail.Factory(Mailing.templateEngine, path.resolve(__dirname, 'mails1/j0_thanks.meta.js'));
    var mail2 = mail._compileWith({
      Hey: 'ok'
    });
    t.notDeepEqual(mail, mail2);
    t.deepEqual(mail2.mandrill, {
      message: {
        subject: 'Thank you !',
        from_email: 'plop@plop.com',
        from_name: 'Mr Plop'
      }
    });
    t.equal(mail2.html, '<div style="background-color: #ff00ff;">ok</div>\n<div style="background-color: #ff00ff;">Awesome.</div>\n');
    t.equal(mail2.text, 'Hello ok\n================\n');
    t.deepEqual(mail2.data, {
      Hey: 'ok'
    });
    t.done();
  }
};
