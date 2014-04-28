var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var _ = require('lodash');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');

test('basic conditional parsing', function(t) {
    t.plan(7);

    var compiled = compiler(fs.readFileSync(__dirname + '/if.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    try {
        runtime.settings = { document: document };
    } catch (e) {
        runtime.settings = { document: jsdom('') };
    }
    var tree = runtime(compiled);
    t.equal(tree.childNodes.length, 1);
    t.equal(tree.childNodes[0].nodeName.toLowerCase(), 'div');
    t.equal(tree.childNodes[0].getAttribute('if'), null);
    t.ok(_.isFunction(tree.childNodes[0]._if));
    t.ok(tree.childNodes[0]._if());

    t.throws(function() {
        compiler(fs.readFileSync(__dirname + '/if-fail.t', 'UTF-8'));
    }, 'should fail on multiple if attributes');
});
