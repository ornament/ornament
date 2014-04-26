var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');

test('basic template compilation', function(t) {
    t.plan(2);

    var compiled = compiler(fs.readFileSync('test/001-basics/empty.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    runtime.set({
        document: jsdom('')
    });
    var tree = runtime(compiled);
    t.equal(tree.childNodes.length, 0);
});
