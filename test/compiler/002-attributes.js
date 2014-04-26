var fs = require('fs');
var test = require('tape');
var compiler = require('../../compiler.js');

test('parse nodes with attributes', function(t) {
    t.plan(1);

    var compiled = compiler(fs.readFileSync('test/templates/compiler/attributes.t', 'UTF-8'));
    t.deepEqual(compiled, require('../compiled/attributes.json'));
});
