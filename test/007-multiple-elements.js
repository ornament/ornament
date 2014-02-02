var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var template = require('../');

test('parsing of multiple top-level elements', function(t) {
    t.plan(19);

    template.set({
        document: jsdom('')
    });
    var compiled = template(fs.readFileSync('test/templates/multiple-elements.t', 'UTF-8'));
    t.equal(compiled.tree.length, 5, 'should parse all the top-level elements');
    var el = compiled.tree[0];
    t.equal(el.nodeName.toLowerCase(), 'label');
    t.equal(el.getAttribute('for'), 'foo');
    t.equal(el.childNodes.length, 1);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, 'Number');
    el = compiled.tree[1];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
    el = compiled.tree[2];
    t.equal(el.nodeName.toLowerCase(), 'input');
    t.equal(el.getAttribute('id'), 'foo');
    t.equal(el.getAttribute('type'), 'number');
    t.equal(el.getAttribute('pattern'), '[0-9]');
    el = compiled.tree[3];
    t.equal(el.nodeName.toLowerCase(), '#text');
    t.equal(el.nodeValue, '\n');
    el = compiled.tree[4];
    t.equal(el.nodeName.toLowerCase(), 'button');
    t.equal(el.getAttribute('class'), 'btn btn-primary');
    t.equal(el.childNodes.length, 1);
    t.equal(el.childNodes[0].nodeName.toLowerCase(), '#text');
    t.equal(el.childNodes[0].nodeValue, 'Clicky');
});
