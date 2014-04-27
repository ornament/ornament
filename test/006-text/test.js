var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');

test('basic text node parsing', function(t) {
    t.plan(4);

    var compiled = compiler(fs.readFileSync(__dirname + '/text.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    runtime.settings = {
        document: jsdom('')
    };
    var tree = runtime(compiled);
    t.equal(tree.childNodes.length, 1);
    t.equal(tree.childNodes[0].nodeName.toLocaleLowerCase(), '#text');
    t.equal(tree.childNodes[0].nodeValue, 'Hello World!\n');
});
