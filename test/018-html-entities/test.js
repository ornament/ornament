var fs = require('fs');
var test = require('tape');
var compiler = require('../../compiler.js');

test('compiler converts HTML entities into corresponding unicode characters', function(t) {
    t.plan(1);

    var compiled = compiler(fs.readFileSync(__dirname + '/entities.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));
});
