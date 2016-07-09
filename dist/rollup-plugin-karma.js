'use strict';

var fs = require('fs');
var rollup = require('rollup').rollup;
var debounce = require('debounce');
var dependencies = new Map();
var changedParents = new Set();
var WAIT = 25;

var touchParents = debounce(function () {
    var now = new Date();
    for (var idx = 0, lst = changedParents.values(); idx < lst.length; idx += 1) {
        fs.utimes(lst[idx], now, now);
    }
    changedParents.clear();
}, WAIT)

function createPreprocessor(args, config, logger, helper) {
    if ( config === void 0 ) config = {};


    var log = logger.create('preprocessor.rollup');

    // Don't continue if there is no rollup configuration
    if (config.rollup) {

        var options = helper.merge({
            format: 'es' // default to 'es' format
        }, config.bundle || {});

        return function (content, file, done) {

            log.debug(' 🗞  Rollup of "%s".', file.originalPath);

            try {
                config.rollup.entry = file.originalPath;

                rollup(config.rollup)
                    .then(function (bundle) {
                        // Map this file to the dependencies that Rollup just
                        // compiled.
                        dependencies.set(
                            file.originalPath,
                            bundle.modules.map(function (b) { return b.id; }).filter(function (op) { return op !== file.originalPath; }));
                        // Work backwards from dependencies to see what
                        // relies on this file, then trigger a recompilation of
                        // it.
                        for (var i = 0, list = dependencies.entries(); i < list.length; i += 1) {
                            var entry = list[i];
                            var parent = entry[0];
                            var dependList = entry[1];

                            if (dependList.includes(file.originalPath)) {
                                log.debug(' \n%s depends on \n\t%s\n    Recompiling it.',
                                    parent, file.originalPath);
                                changedParents.add(parent);
                                touchParents();
                            }
                        }

                        var generated = bundle.generate(options);
                        var processed = generated.code;

                        if (options.sourceMap === 'inline') {
                            processed += "# sourceMappingURL=" + (generated.map.toUrl());
                        }

                        done(null, processed);
                    })
                    .catch(function (error) {
                        log.error('Failed to process "%s".\n  %s', file.originalPath, error.message);
                        done(error, null);
                    });

            } catch (e) {
                log.error('%s\n at %s\n%s', e.message, file.originalPath, e.stack);
                done(e, null);
            }
        };
    }
}

createPreprocessor.$inject = ['args', 'config.rollupPreprocessor', 'logger', 'helper'];

// PUBLISH DI MODULE
var index = {
    'preprocessor:rollup': ['factory', createPreprocessor]
};

module.exports = index;