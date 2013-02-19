var fs    = require("fs");
var glob  = require('glob');
var path  = require('path');
var _     = require('lodash');
var Q     = require('q');
var async = require('async');

var Mail = require('./Mail');

function Mailing(options){
  options = options || {};

  this.mails          = [];
  this.mailProvider   = options.mailProvider ? options.mailProvider : Mailing.mailProvider;
  this.templateEngine = options.templateEngine ? options.templateEngine : Mailing.templateEngine;

  if( !this.templateEngine.compile || !_.isFunction(this.templateEngine.compile) || this.templateEngine.compile.length !== 1 ||
      !this.templateEngine.exec    || !_.isFunction(this.templateEngine.exec)    || this.templateEngine.exec.length !== 2){
    throw new Error(Mailing.TEMPLATE_ENGINE_ERR);
  }

  if(!this.mailProvider || !_.isFunction(this.mailProvider.send) || this.mailProvider.send.length !== 2){
    throw new Error(Mailing.MAIL_PROVIDER_ERR);
  }
}

Mailing.MAIL_INTERNAL_CONCURRENT_LIMIT = 4;
Mailing.MAIL_PROVIDER_ERR              = "Please use a supported email provider like `transacemail-mandrill`\nThe provider should implement .send(mail, callback);";
Mailing.TEMPLATE_ENGINE_ERR            = "the Template Engine should implement\ncompile(templateString): Function\nexec(fnCompiledTemplate, data): String";

/**
 * Mailing Factory
 * @param  {String} path Path to mails folder
 * @param {Object} options Option object option parameters are:
 *  templateEngine : Set the Template Engine
 *  mailProvider   : Set the Mail Provider
 * @optional
 * @return {Mailing}
 */
Mailing.compile = function(path, options){
  var mailing = new Mailing(options);
  return mailing._reset(path);
};



/**
 * Send emails that comply with .sendIf(args, ...)
 * @param {Variadic} args... Any number of arguments that will be forwarded to each email `.sendIf`
 * @return {Promise}
 */
Mailing.prototype.sendIf = function(){
  var deferred = Q.defer();
  var args = _.toArray(arguments);

  function mailChecker(mail, fn){
    mail.sendIf.apply(mail, args.concat(this._sendThroughProvider.bind(this, function(err, ok){
      // We must silent the error otherwise forEachLimit will be stopped
      fn(null, ok);
    }, mail)));
  }

  async.forEachLimit(
    this.mails,
    Mailing.MAIL_INTERNAL_CONCURRENT_LIMIT,
    mailChecker.bind(this),
    deferred.makeNodeResolver());

  return deferred.promise;
};

Mailing.prototype.getMail = function(name){
  return _.find(this.mails, function(mail){
    return mail.getName() === name;
  });
};

/**
 * Helper to send one email (beware the sendIf function must accept the parameters)
 */
Mailing.prototype.sendMail = function(templateName /*, args... , fn*/ ){
  var args = _.toArray(arguments).slice(1);
  var fn = args.pop();
  if(!_.isFunction(fn)){throw new Error(".sendMail: last parameter must be a function");}

  var mail = this.getMail(templateName);
  if(!mail){return fn(new Error("Template not found"));}

  args.push(this._sendThroughProvider.bind(this, fn, mail));
  mail.sendIf.apply(mail, args);
};

/**
 * Default mail provider
 * @type {Object}
 */
Mailing.mailProvider = {
  send: function(fn, mail){
    throw new Error(Mailing.MAIL_PROVIDER_ERR);
  }
};

/**
 * Default template engine (Underscore template)
 * @type {Object}
 */
Mailing.templateEngine = {
  compile:function(templateString){
    return _.template(templateString, null, {
      evaluate:    /\{\{#([\s\S]+?)\}\}/g,            // {{# console.log("blah") }}
      interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g,  // {{ title }}
      escape:      /\{\{\{([\s\S]+?)\}\}\}/g         // {{{ title }}}
    });
  },
  exec: function(compiledTemplate, data){
    return compiledTemplate(data);
  }
};

/**
 * ._sendThroughProvider
 * @ignore
 * @param  {Function} fn           [description]
 * @param  {[type]}   mail         [description]
 * @param  {[type]}   sendIfReturn [description]
 * @return {[type]}                [description]
 */
Mailing.prototype._sendThroughProvider = function(fn, mail, sendIfReturn){
  if(!sendIfReturn){return fn(new Error("sendIf returned a falsy value"));}
  this.mailProvider.send(mail._compileWith(sendIfReturn), fn);
};

/**
 * ._reset
 * @ignore
 * @param  {[type]} mailDir [description]
 * @return {[type]}         [description]
 */
Mailing.prototype._reset = function(mailDir){
  glob(path.resolve(mailDir, './'+'*.meta.js'), {sync:true}, function(err, files){
    this.mails = files.map(Mail.Factory.bind(Mail, this.templateEngine));
  }.bind(this));
  return this;
};

/**
 * Export Mail
 * @ignore
 */

Mailing.Mail   = Mail;
module.exports = Mailing;
