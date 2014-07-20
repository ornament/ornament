var fs = require('fs');
var test = require('tape');
var compiler = require('../../compiler.js');

test('parses and renders comments', function(t) {
    t.plan(1);

    var compiled = compiler(fs.readFileSync(__dirname + '/comment.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));
});
