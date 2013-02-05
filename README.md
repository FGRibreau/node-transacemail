# Transactional Email & Templated Email for NodeJS done right [![Build Status](https://travis-ci.org/FGRibreau/node-transacemail.png)](https://travis-ci.org/FGRibreau/node-transacemail)

Transactional Email & Templated Email for NodeJS that just work.

`transacemail` provides an organized way to handle transactional email while still being fully modular.

## Getting Started
Install the module with: `npm install transacemail`

```javascript
var Mailing = require('transacemail');

Mailing.compile('path/to/mails/folder');

// See /example/
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
v0.1.0 - Initial commit (4 fev. 2012)

## License
Copyright (c) 2013 Francois-Guillaume Ribreau
Licensed under the MIT license.
