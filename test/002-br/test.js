var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');

test('basic markup parsing', function(t) {
    t.plan(3);

    var compiled = compiler(fs.readFileSync('test/002-br/br.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    runtime.set({
        document: jsdom('')
    });
    var tree = runtime(compiled);
    t.equal(tree.childNodes.length, 1);
    t.equal(tree.childNodes[0].nodeName.toLowerCase(), 'br', 'with the correct tag name');
});
