module.exports = {
  /**
   * Style to embed
   */
  "styles":["./css/global.css", "./css/extra.css"],

  /**
   * Mandrill parameters
   */
  "mandrill":{
    "message":{
      /* text: will be taken from j0_thanks.txt */
      /* to: will be automatically completed */
      subject: "Thank you !",
      from_email: "plop@plop.com",
      from_name:"Mr Plop"
    }
  }
};
