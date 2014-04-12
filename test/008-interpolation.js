var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var template = require('../');

test('basic string interpolation', function(t) {
    t.plan(11);

    template.set({
        document: jsdom('')
    });
    var data = {
        title: 'foo',
        subtitle: 'bar'
    };
    var compiled = template(fs.readFileSync('test/templates/interpolation.t', 'UTF-8'));
    t.equal(compiled.tree.length, 2, 'should parse all the top-level elements');
    var el = compiled.tree[0];
    t.equal(el.nodeName.toLowerCase(), 'h1');
    t.equal(el.childNodes.length, 1);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, '{{title}}');
    t.equal(el.childNodes[0].fn({ title: 'foo' }), 'foo');
    el = compiled.tree[1];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n{{subtitle}}');
    t.equal(el.fn(data), '\nbar');
    t.equal(el.fn({}), '\n');
    t.equal(el.fn(), '\n');
});
