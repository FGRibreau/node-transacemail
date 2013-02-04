var fs    = require("fs");
var glob  = require('glob');
var path  = require('path');
var _     = require('lodash');
var Q     = require('q');
var async = require('async');

var Mail = require('./Mail');

function Mailing(){
  this.mails = [];
  this.mailProvider = null;
}

function invokeApply(fnName, args){
  return function(o){
    return o[fnName].apply(o, args);
  };
}

Mailing.mailProvider = {
  send: function(mail){
    throw new Error("Please setup an email provider like `transacemail-mandrill`");
  }
};

/**
 * Send email that comply with .sendIf(args, ...)
 * @return {Promise}
 */
Mailing.prototype.sendIf = function(/* args */){
  var args = _.toArray(arguments);

  this.mails.forEach(function(mail){
    // Check if the email is sendable with the current parameters
    var obj = mail.sendIf.apply(mail, args);
    if(!obj){return;}

    // Send it
    this.mailProvider.send(mail._compileWith(obj));
  }.bind(this));
};

Mailing.prototype.reset = function(mailDir){
  glob(path.resolve(mailDir, './*.meta.js'), {sync:true}, function(err, files){
    this.mails = files.map(Mail.Factory);
  }.bind(this));
  return this;
};

/**
 * Set the mail provider
 */
Mailing.prototype.setMailProvider = function(provider){
  if(!provider && !_.isFunction(provider.send)){
    throw new Error("Please use a supporter email provider like `transacemail-mandrill`");
  }

  Mailing.mailProvider = provider;
};

/**
 * Mailing Factory
 * @param  {String} path Path to mails folder
 * @return {Mailing}
 */
Mailing.compile = function(path){
  var mailing = new Mailing();
  return mailing.reset(path);
};

Mailing.Mail   = Mail;
module.exports = Mailing;
