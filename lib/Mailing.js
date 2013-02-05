var fs    = require("fs");
var glob  = require('glob');
var path  = require('path');
var _     = require('lodash');
var Q     = require('q');
var async = require('async');

var Mail = require('./Mail');

function Mailing(){
  this.mails          = [];
  this.mailProvider   = Mailing.mailProvider;
  this.templateEngine = Mailing.templateEngine;
}

Mailing.MAIL_INTERNAL_CONCURRENT_LIMIT = 4;
Mailing.MAIL_PROVIDER_ERR              = "Please use a supported email provider like `transacemail-mandrill`\nThe provider should implement .send(mail, callback);";
Mailing.TEMPLATE_ENGINE_ERR            = "the Template Engine should implement\ncompile(templateString): Function\nexec(fnCompiledTemplate, data): String";

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
    return _.template(templateString, null, {interpolate : /\{\{(.+?)\}\}/g});
  },
  exec: function(compiledTemplate, data){
    return compiledTemplate(data);
  }
};

/**
 * Send email that comply with .sendIf(args, ...)
 * @return {Promise}
 */
Mailing.prototype.sendIf = function(/* args... */){
  var deferred = Q.defer();
  var args = _.toArray(arguments);

  function mailChecker(mail, fn){
    args.push(this._sendThroughProvider.bind(this, fn, mail));
    mail.sendIf.apply(mail, args);
  }

  async.forEachLimit(
    this.mails,
    Mailing.MAIL_INTERNAL_CONCURRENT_LIMIT,
    mailChecker.bind(this),
    deferred.makeNodeResolver());

  return deferred.promise;
};


/**
 * Set the mail provider
 * @param {Object} provider mail provider to use
 */
Mailing.prototype.setMailProvider = function(provider){
  if(!provider || !_.isFunction(provider.send) || provider.send.length !== 2){
    throw new Error(Mailing.MAIL_PROVIDER_ERR);
  }

  this.mailProvider = provider;
  return this;
};

/**
 * Set the template engine
 * @param {Object} engine template engine to use
 */
Mailing.prototype.setTemplateEngine = function(engine){
  if(!engine.compile || !_.isFunction(engine.compile) || engine.compile.length !== 1 ||
    !engine.exec || !_.isFunction(engine.exec) || engine.exec.length !== 2){
    throw new Error(Mailing.TEMPLATE_ENGINE_ERR);
  }

  this.templateEngine = engine;
  return this;
};


/**
 *
 * @private
 * @param  {Function} fn           [description]
 * @param  {[type]}   mail         [description]
 * @param  {[type]}   sendIfReturn [description]
 * @return {[type]}                [description]
 */
Mailing.prototype._sendThroughProvider = function(fn, mail, sendIfReturn){
  if(!sendIfReturn){return fn();}
  this.mailProvider.send(mail._compileWith(sendIfReturn), fn);
};

/**
 *
 * @private
 * @param  {[type]} mailDir [description]
 * @return {[type]}         [description]
 */
Mailing.prototype._reset = function(mailDir){
  glob(path.resolve(mailDir, './*.meta.js'), {sync:true}, function(err, files){
    this.mails = files.map(Mail.Factory.bind(Mail, this.stemplateEngine));
  }.bind(this));
  return this;
};

/**
 * Mailing Factory
 * @param  {String} path Path to mails folder
 * @return {Mailing}
 */
Mailing.compile = function(path){
  var mailing = new Mailing();
  return mailing._reset(path);
};

Mailing.Mail   = Mail;
module.exports = Mailing;
