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
    _.forEach(tree.childNodes, function(child) {
        html += child.nodeValue || child.outerHTML;
    });
    t.equal(html, '<span>Doe, John</span>\n<span>Hello John Doe!</span>\n' +
        '<span>Username: JohnDoe</span>\n<span>\'John\'</span>');
});
