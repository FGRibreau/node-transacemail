# Transactional Email & Templated Email for NodeJS done right [![Build Status](https://travis-ci.org/FGRibreau/node-transacemail.png)](https://travis-ci.org/FGRibreau/node-transacemail)

***Transacemail*** provides an organized way to handle transactional email while still being fully decoupled and modular.

## Features
* Clear Separation of Concerns
* Supports any file extension
  - `Mailing.Mail.DEFAULT_HTML_EXT = ".html";`
  - `Mailing.Mail.DEFAULT_TEXT_EXT = ".text";`
  - `Mailing.Mail.DEFAULT_META_EXT = ".meta.js";`
* Supports any Template Engine (underscore template by default)
  - `mailing.setTemplateEngine(engine);`
* Supports any Mail Provider (no default) [Mandrill](http://github.com/FGRibreau/node-transacemail-mandrill)...
  - `mailing.setMailProvider(require('transacemail-mandrill')('apikey'));`
* Supports any number of CSS files for each email
  - Css automatically inlined for free thanks to [Juice](https://github.com/LearnBoost/juice)

## Getting Started
Install the module with: `npm install transacemail`

See [/example/](https://github.com/FGRibreau/node-transacemail/tree/master/example).

## How to implement a TemplateEngine
TemplateEngine are object that should implement the following methods:
 - `.compile(templateString) -> Function`
 - `.exec(fnCompiledTemplate, data) -> String`
See `Mailing.templateEngine` in [Mailing.js](https://github.com/FGRibreau/node-transacemail/blob/master/lib/Mailing.js#L34).

## How to implement a MailProvider
MailProviders just have to implement: `.send(mail, callback(err, success))`.
See [node-transacemail-mandrill](http://github.com/FGRibreau/node-transacemail-mandrill).

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
v0.1.0 - Initial commit (4 fev. 2012)

## License
Copyright (c) 2013 Francois-Guillaume Ribreau
Licensed under the MIT license.
