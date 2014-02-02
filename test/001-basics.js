var fs = require('fs');
var test = require('tape');
var jsdom = require('jsdom').jsdom;
var _ = require('lodash');
var template = require('../');

test('basic template compilation', function(t) {
    t.plan(1);

    template.set({
        document: jsdom('')
    });
    var compiled = template(fs.readFileSync('test/templates/empty.t', 'UTF-8'));
    t.ok(_.isFunction(compiled), 'should return a function');
});
