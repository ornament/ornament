var fs = require('fs');
var test = require('tape');
var compiler = require('../../compiler.js');

test('basic template compilation', function(t) {
    t.plan(1);

    var compiled = compiler(fs.readFileSync('test/templates/compiler/interpolation.t', 'UTF-8'));
    t.deepEqual(compiled, require('../compiled/basic.json'));
});
