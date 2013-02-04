var path  = require('path');
var fs    = require('fs');
var _     = require('lodash');
var juice = require('juice');

function Mail(metaPath){
  this.styles = [];
  this._dir  = path.dirname(metaPath);
  this._name = path.basename(metaPath, Mail.DEFAULT_META_EXT);

  /**
   * The default is to not send the email
   * @return {Function}
   */
  this.sendIf = function(){return false;};
}

Mail.DEFAULT_META_EXT = '.meta.js';
Mail.DEFAULT_HTML_EXT = '.html';
Mail.DEFAULT_TEXT_EXT = '.txt';

/**
 * The default template engine use J. Resig/Underscore template
 * @type {Object}
 */
Mail.templateEngine = {
  compile:function(templateString){
    return _.template(templateString, null, {interpolate : /\{\{(.+?)\}\}/g});
  },
  exec: function(compiledTemplate, data){
    return compiledTemplate(data);
  }
};

Mail.setTemplateEngine = function(engine){
  if(!engine.compile || !engine.exec){
    throw new Error("Engine should implement\ncompile(templateString, data): Function\nexec(compiledTemplate, data): String");
  }

  Mail.templateEngine = engine;
};

Mail.prototype._readMeta = function(){
  var metaPath = path.resolve(this._dir, this._name+Mail.DEFAULT_META_EXT);
  if(!fs.existsSync(metaPath)){
    throw new Error("Meta file not found: " + metaPath);
  }
  _.extend(this, require(metaPath));
  return this;
};

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
 */
Mail.prototype._compileWith = function(args){
  var mail  = _.clone(this);
  // Html
  if(this.html && !this.tplHTML){
    this.tplHTML = Mail.templateEngine.compile(this.html);
  }
  if(this.html){
    mail.html = Mail.templateEngine.exec(this.tplHTML, args);
  }
  // Text
  if(this.text && !this.tplText){
    this.tplText = Mail.templateEngine.compile(this.text);
  }
  if(this.text){
    mail.text = Mail.templateEngine.exec(this.tplText, args);
  }
  return mail;
};

Mail.Factory = function(metaPath){
  return new Mail(metaPath)
        ._readMeta()
        ._readHTML()
        ._mergeCss() // .compileTemplate
        ._readText();
};

module.exports = Mail;

