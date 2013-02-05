var path  = require('path');
var fs    = require('fs');
var _     = require('lodash');
var juice = require('juice');

/**
 * Mail constructor
 * @param {Object} templateEngine Template Engine that will be used to render the mail
 * @param {String} metaPath       Path to the mail meta file
 * @private
 */
function Mail(templateEngine, metaPath){
  this.styles         = [];
  this._dir           = path.dirname(metaPath);
  this._name          = path.basename(metaPath, Mail.DEFAULT_META_EXT);
  this.templateEngine = templateEngine;
  this.sendIf = function(fn){return fn(false);};
}

/**
 * Meta file extension
 * @type {String}
 */
Mail.DEFAULT_META_EXT = '.meta.js';

/**
 * HTML mail format extension
 * @type {String}
 */
Mail.DEFAULT_HTML_EXT = '.html';

/**
 * TEXT mail format extension
 * @type {String}
 */
Mail.DEFAULT_TEXT_EXT = '.txt';

/**
 * _readMeta
 * @private
 * @return {[type]} [description]
 */
Mail.prototype._readMeta = function(){
  var metaPath = path.resolve(this._dir, this._name+Mail.DEFAULT_META_EXT);
  if(!fs.existsSync(metaPath)){
    throw new Error("Meta file not found: " + metaPath);
  }
  _.extend(this, require(metaPath));
  return this;
};

/**
 * _readHTML
 * @private
 * @return {[type]} [description]
 */
Mail.prototype._readHTML = function(){
  var htmlPath          = path.resolve(this._dir, this._name+Mail.DEFAULT_HTML_EXT);
  if(!fs.existsSync(htmlPath)){return this;}
  this.html             = fs.readFileSync(htmlPath).toString('utf8');
  return this;
};

Mail.prototype._mergeCss = function(){
  var stylesheets = this.styles
    .map(path.resolve.bind(path, this._dir))
    .filter(fs.existsSync.bind(fs))
    .map(function(path){
      return fs.readFileSync(path).toString('utf8');
    });
  this.html = juice(this.html, stylesheets.join('\n'));
  return this;
};

/**
 * _readText
 * @private
 * @return {[type]} [description]
 */
Mail.prototype._readText = function(){
  var textPath          = path.resolve(this._dir, this._name+Mail.DEFAULT_TEXT_EXT);
  if(!fs.existsSync(textPath)){return this;}
  this.text             = fs.readFileSync(textPath).toString('utf8');
  return this;
};

/**
 * Compile the mail with the specified arguments
 * @param  {[type]} args [description]
 * @return {[type]}      [description]
 * @private
 */
Mail.prototype._compileWith = function(args){
  var mail  = _.clone(this);
  // Html
  if(this.html && !this.tplHTML){
    this.tplHTML = this.templateEngine.compile(this.html);
  }
  if(this.html){
    mail.html = this.templateEngine.exec(this.tplHTML, args);
  }
  // Text
  if(this.text && !this.tplText){
    this.tplText = this.templateEngine.compile(this.text);
  }
  if(this.text){
    mail.text = this.templateEngine.exec(this.tplText, args);
  }
  // Append data
  mail.data = args;
  return mail;
};

/**
 * Mail Factory
 * @param {Object} templateEngine Template Engine that will be used to render the mail
 * @param {String} metaPath Path to the mail meta file
 * @return {Mail} A Mail object
 */
Mail.Factory = function(templateEngine, metaPath){
  return new Mail(templateEngine, metaPath)
        ._readMeta()
        ._readHTML()
        ._mergeCss()
        ._readText();
};

/**
 * Export Mail
 * @type {Function}
 * @private
 */
module.exports = Mail;

