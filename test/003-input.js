var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var template = require('../');

test('basic markup parsing', function(t) {
    t.plan(4);

    template.set({
        document: jsdom('')
    });
    var compiled = template(fs.readFileSync('test/templates/input.t', 'UTF-8'));
    t.equal(compiled.tree.length, 1, 'should parse a single element');
    t.equal(compiled.tree[0].nodeName.toLowerCase(), 'input', 'with the correct tag name');
    t.equal(compiled.tree[0].getAttribute('type'), 'number', 'with the correct type attribute');
    t.equal(compiled.tree[0].getAttribute('pattern'), '[0-9]', 'with the correct pattern attribute');
});
