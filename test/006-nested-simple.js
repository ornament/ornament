var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var template = require('../');

test('parsing of nested elements (simple)', function(t) {
    t.plan(9);

    template.set({
        document: jsdom('')
    });
    var compiled = template(fs.readFileSync('test/templates/nested-simple.t', 'UTF-8'));
    t.equal(compiled.tree.length, 1);
    var el = compiled.tree[0];
    t.equal(el.nodeName.toLowerCase(), 'div');
    t.equal(el.getAttribute('class'), 'pull-right');
    t.equal(el.children.length, 1);
    el = el.children[0];
    t.equal(el.nodeName.toLowerCase(), 'span');
    t.equal(el.getAttribute('class'), 'muted');
    t.equal(el.childNodes.length, 1);
    el = el.childNodes[0];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n        FUBAR\n    ');
});
