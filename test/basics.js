var fs = require('fs');
var test = require('tape');
var _ = require('lodash');
var template = require('../');

test('basic template compilation', function(t) {
    t.plan(1);

    var compiled = template(fs.readFileSync('test/templates/empty.t', 'UTF-8'));
    t.ok(_.isFunction(compiled), 'should return a function');
});
