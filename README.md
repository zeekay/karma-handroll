# karma-handroll [![Build Status](https://travis-ci.org/TrySound/karma-handroll.svg?branch=master)](https://travis-ci.org/TrySound/karma-handroll)

> A Karma preprocessor plugin which integrates [handroll](http://github.com/zeekay/handroll)

This plugin is a Karma preprocessor to compile and bundle your spec entry point
on the fly. It works seamlessly with all handroll plugins.

# Features

  - supports handroll by default
  - supports both Babel and Buble as the ES2015 compiler
  - sourceMap
  - recompiling of dependencies when files changes
  - ES3, ES5, ES2015, ES2016, and ES2017 (*with Babel or Buble*)

# Installation

The easiest way is to keep karma-handroll as a `devDependency`. You can simple do it by:

```js
npm i karma-handroll --save-dev
```

# Configuration

*Note!* As a rule of thumb, use of `umd` format doesn't make sense in tests, and will throw a warning without a module name.

Following code shows the default configuration

```js
// karma.conf.js
module.exports = function (config) {
  config.set({
    preprocessors: {
     'test/**/*.js': ['handroll']
    },
    // handroll settings. See handroll documentation
    handroll: {
      plugins: [
        buble() // ES2015 compiler by the same author as handroll
      ],
      // will help to prevent conflicts between different tests entries
      format: 'iife',
      sourceMap: 'inline'
    }
  });
};
```
