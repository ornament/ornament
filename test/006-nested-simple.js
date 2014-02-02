var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var template = require('../');

test('parsing of nested elements (simple)', function(t) {
    t.plan(13);

    template.set({
        document: jsdom('')
    });
    var compiled = template(fs.readFileSync('test/templates/nested-simple.t', 'UTF-8'));
    t.equal(compiled.tree.length, 1);
    var el = compiled.tree[0];
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
