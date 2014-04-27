var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var compiler = require('../../compiler.js');
var runtime = require('../../runtime.js');

test('basic string interpolation', function(t) {
    t.plan(24);

    var compiled = compiler(fs.readFileSync(__dirname + '/interpolation.t', 'UTF-8'));
    t.deepEqual(compiled, require('./compiled.json'));

    runtime.settings = {
        document: jsdom('')
    };
    var data = {
        first: 'John',
        last: 'Doe'
    };
    var tree = runtime(compiled, data);
    t.equal(tree.childNodes.length, 7);
    var el = tree.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), 'span');
    t.equal(el.childNodes.length, 1);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, 'Doe, John');
    el = tree.childNodes[1];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
    el = tree.childNodes[2];
    t.equal(el.nodeName.toLowerCase(), 'span');
    t.equal(el.childNodes.length, 1);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, 'Hello John Doe!');
    el = tree.childNodes[3];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
    el = tree.childNodes[4];
    t.equal(el.nodeName.toLowerCase(), 'span');
    t.equal(el.childNodes.length, 1);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, 'Username: JohnDoe');
    el = tree.childNodes[5];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
    el = tree.childNodes[6];
    t.equal(el.nodeName.toLowerCase(), 'span');
    t.equal(el.childNodes.length, 1);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, '\'John\'');
});
