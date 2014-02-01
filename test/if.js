var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var _ = require('lodash');
var template = require('../');

test('basic conditional parsing', function (t) {
    t.plan(6);

    template.set({
        document: jsdom("")
    });
    var compiled = template(fs.readFileSync('test/templates/if.t', 'UTF-8'));
    t.equal(compiled.tree.length, 1, 'should parse a single element');
    t.equal(compiled.tree[0].tagName.toLowerCase(), "div", 'with the correct tag name');
    t.equal(compiled.tree[0].getAttribute("if"), null, 'without including the if attribute');
    t.ok(_.isFunction(compiled.tree[0]._if), 'should compile the conditional');
    t.ok(compiled.tree[0]._if(), 'should compile the conditional');

    t.throws(function () {
        template(fs.readFileSync('test/templates/if-fail.t', 'UTF-8'));
    }, 'should fail on multiple if attributes');
});
