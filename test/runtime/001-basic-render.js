var _ = require('lodash');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var runtime = require('../../runtime.js');

test('basic template rendering', function(t) {
    t.plan(1);

    runtime.set({
        document: jsdom('')
    });
    var template = require('../compiled/basic.json');
    var tree = runtime(template, { first: 'John', last: 'Doe' });
    var html = '';
    _.forEach(tree.childNodes, function (child) {
        html += child.nodeValue || child.innerHTML;
    });
    t.equal(html, 'Doe, John\nHello John Doe!\nUsername: JohnDoe\n\'John\'');
});
