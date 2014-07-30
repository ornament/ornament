var fs = require('fs');
var test = require('tape');
var compiler = require('../../compiler.js');

test('allows for an optional `parse` attribute on input elements', function(t) {
    t.plan(1);

    var compiled = compiler(fs.readFileSync(__dirname + '/template.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));
});
