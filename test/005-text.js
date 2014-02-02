var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var template = require('../');

test('basic text node parsing', function(t) {
    t.plan(3);

    template.set({
        document: jsdom('')
    });
    var compiled = template(fs.readFileSync('test/templates/text.t', 'UTF-8'));
    t.equal(compiled.tree.length, 1, 'should parse a single text node');
    t.equal(compiled.tree[0].nodeName.toLocaleLowerCase(), '#text', 'with the correct tag name');
    t.equal(compiled.tree[0].nodeValue, 'Hello World!\n', 'with the correct contents');
});
