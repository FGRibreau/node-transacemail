var Mailing = require('../');
var async   = require('async');
var _       = require('lodash');

/**
 * Simulate a database
 */
var users = [{
    // `email` and `name` are the only required field for node-transacemail to work
    email:'barney@awesome.com',
    name:"Barney Stinson",
    lastConnected:1, // number of days
    online:true,
    myOtherVariable:["a","b","c"]
},{
    email:'ted@awesome.com',
    name:"Ted Mosby",
    lastConnected:10, // number of days
    online:false,
    myOtherVariable:[]
}];

var globalData = {
  currentDate: Date.now()
};

// File extension can be customized
Mailing.Mail.DEFAULT_META_EXT = ".meta.js";
Mailing.Mail.DEFAULT_HTML_EXT = ".html";
Mailing.Mail.DEFAULT_TEXT_EXT = ".txt";


var templateDir = require('path').resolve(__dirname, './mails');

// Compile all templates in ./mails
var mails = Mailing.compile(templateDir, {
  /**
   * Option object
   */

  // Setup the template engine (optional)
  templateEngine: {
    compile:function(templateString){
      return _.template(templateString, null, {
        evaluate:    /\{\{#([\s\S]+?)\}\}/g,            // {{# console.log("blah") }}
        interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g,  // {{ title }}
        escape:      /\{\{\{([\s\S]+?)\}\}\}/g          // {{{ title }}}
      });
    },
    exec: function(compiledTemplate, data){
      return compiledTemplate(data);
    }
  },

  // Setup the mail provider (required)
  mailProvider:require('transacemail-mandrill')('apikey')
});

// Now we just have to send email to the users
function sender(user, cb){
  // See ./mails/mail1.meta.js .sendIf()
  // Every parameters will be forwarded to .sendIf function from each {mail}.meta.js
  // if {mail}.sendIf returns an object instead of false:
  // - the email will be compiled the HTML template (if specified) with the specified object
  // - and then send through the mail provider
  mails
    .sendIf(user, globalData, _ /* , etc... */)
    .fin(done);
}

// Loop over our users (or anything else)
async.forEachLimit(5, users, sender, function(){
  console.log('DONE !');
});
