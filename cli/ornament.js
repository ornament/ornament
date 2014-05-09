#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var mkdir = require('mkdirp');
var compiler = require('../compiler.js');
var args = require('nomnom')
    .option('output', {
        abbr: 'o',
        help: 'Output file, will send to stdout if not specified'
    })
    .option('file', {
        position: 0,
        required: true,
        help: 'The template to compile'
    })
    .option('version', {
        flag: true,
        help: 'Print version and exit',
        callback: function() {
            return require('../package.json').version;
        }
    })
    .parse();

fs.readFile(args.file, 'utf8', function (err, data) {
    if (err) {
        if (err.code === 'ENOENT') {
            console.error('File \'%s\' does not exist', args.file);
            process.exit(1);
        }
        throw err;
    }
    var compiled;
    try {
        compiled = compiler(data);
    } catch (e) {
        console.error('Syntax error in template \'%s\': %s', args.file, e.message);
        process.exit(1);
    }
    var str = JSON.stringify(compiled);
    if (args.output) {
        var dirname = path.dirname(args.output);
        mkdir(dirname, function (err) {
            if (err) { throw err; }
            fs.writeFile(args.output, str, 'utf8', function (err) {
                if (err) {
                    if (err.code === 'EISDIR') {
                        console.error('\'%s\' is a directory', args.output);
                        process.exit(1);
                    }
                    throw err;
                }
            });
        });
    } else {
        process.stdout.write(str);
    }
});
