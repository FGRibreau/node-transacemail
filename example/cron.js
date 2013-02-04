var Mailing = require('../');
var async   = require('async');
var _       = require('lodash');

/**
 * Simulate a database
 */
var users = [{
    name:"Barney",
    surname:"Stinson",
    lastConnected:1, // number of days
    online:true,
    myOtherVariable:["a","b","c"]
},{
    name:"Ted",
    surname:"Mosby",
    lastConnected:10, // number of days
    online:false,
    myOtherVariable:[]
}];

var globalData = {
  currentDate: Date.now()
};

// Change defaults
// Mailing.Mail.DEFAULT_META_EXT = ".meta.js";
// Mailing.Mail.DEFAULT_HTML_EXT = ".html";
// Mailing.Mail.DEFAULT_TEXT_EXT = ".txt";

// Change the template engine
// Mailing.Mail.setTemplateEngine({
//   compile:function(templateString){
//     return _.template(templateString, null, {interpolate : /\{\{(.+?)\}\}/g});
//   },
//   exec: function(compiledTemplate, data){
//     return compiledTemplate(data);
//   }
// });

// Compile all templates in ./mails
var mails = Mailing.compile(require('path').resolve(__dirname, './mails'));

// Setup the mail provider
mails.setMailProvider(require('transacemail-mandrill')('apikey'));

function sender(user, cb){
  // See ./mails/mail1.meta.js .sendIf()
  // Every parameters will be forwarded to .sendIf function from each {mail}.meta.js
  // if {mail}.sendIf returns an object instead of false, that object will be forwarded to the mail:
  // - the email will be compiled the HTML template (if specified) with the specified object
  // - and then send through the mail provider
  mails.sendIf(user, globalData, _ /* , etc... */).always(done);
}

// Loop over our users (or anything else)
async.forEachLimit(5, users, sender, function(){
  console.log('DONE !');
});
