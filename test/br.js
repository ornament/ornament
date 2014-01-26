var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var _ = require('lodash');
var template = require('../');

test('basic markup parsing', function (t) {
    t.plan(2);

    template.set({
        document: jsdom("")
    });
    var compiled = template(fs.readFileSync('test/templates/br.t', 'UTF-8'));
    t.equal(compiled.tree.length, 1, 'should parse a single element');
    t.equal(compiled.tree[0].tagName.toLowerCase(), "br", 'with the correct tag name');
});
