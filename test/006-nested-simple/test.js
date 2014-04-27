var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');

test('parsing of nested elements (simple)', function(t) {
    t.plan(14);

    var compiled = compiler(fs.readFileSync('test/006-nested-simple/nested-simple.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    runtime.settings = {
        document: jsdom('')
    };
    var tree = runtime(compiled);
    t.equal(tree.childNodes.length, 1);
    var el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'div');
    t.equal(el.getAttribute('class'), 'pull-right');
    t.equal(el.childNodes.length, 3);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, '\n    ');
    t.equal(el.childNodes[1].nodeName.toLowerCase(), 'span');
    t.equal(el.childNodes[1].getAttribute('class'), 'muted');
    t.equal(el.childNodes[1].childNodes.length, 1);
    t.equal(el.childNodes[2].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[2].nodeValue, '\n');
    el = el.childNodes[1].childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n        FUBAR\n    ');
});
