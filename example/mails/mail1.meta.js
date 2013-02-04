module.exports = {
  /**
   * Css styles to inject into HTML
   */
  styles: ['./css/global.css', './css/mail1.css'],

  /**
   * Mandrill parameters (see `transacemail-mandrill` for more details)
   * `node-transacemail` can support ANY provider
   */
  "mandrill":{
    "message":{
      subject: "Hello! Nice to meet you !",
      from_email: "team@brin.gr",
      from_name:"Francois-Guillaume Ribreau"
      /* to: will be automatically completed */
      /* html: will be taken from mail1.html */
      /* text: will be taken from mail1.txt */
    }
  },

  /**
   * [sendIf description]
   * @param  {Mixed} args  0, 1 or more parameters
   * @return {Boolean|Object} false, the email will not be send. Otherwise return an object
   */
  sendIf: function(user, globalData, _){
    if(user.lastConnected < 1 && !user.online /* && and other rules... */){
      // The user does not match the rules for this email
      return false;
    }

    // Otherwise, send the current email to the user
    // `.sendIf` returned data will be injected into the templates (if any)
    return _.extend(user, globalData);
  }
};
