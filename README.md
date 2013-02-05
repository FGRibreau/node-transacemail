# Transactional Email & Templated Email for NodeJS done right [![Build Status](https://travis-ci.org/FGRibreau/node-transacemail.png)](https://travis-ci.org/FGRibreau/node-transacemail) [![Build Status](https://drone.io/github.com/FGRibreau/node-transacemail/status.png)](https://drone.io/github.com/FGRibreau/node-transacemail/latest)

***Transacemail*** provides an organized way to handle transactional email while still being fully decoupled and modular.

## NPM
Install the module with: `npm install transacemail`

## [Documentation](http://fgribreau.github.com/node-transacemail/docs/index.html)

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
