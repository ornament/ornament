var _ = require('lodash');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var runtime = require('../../runtime.js');
var Model = require('backbone').Model;

test('reactive templates', function(t) {
    t.plan(5);

    runtime.set({
        document: jsdom(''),
        binding: require('../../binding-backbone.js')
    });
    var template = require('../compiled/basic.json');
    var model = new Model();
    var tree = runtime(template, model);

    function html() {
        return _.reduce(tree.childNodes, function(str, child) {
            return str + (child.nodeValue || child.outerHTML);
        }, '');
    }

    t.equal(html(), '<span>, </span>\n<span>Hello  !</span>\n<span>Username: </span>\n<span>\'\'</span>');

    model.set('first', 'Drake');

    t.equal(html(), '<span>, Drake</span>\n<span>Hello Drake !</span>\n' +
        '<span>Username: Drake</span>\n<span>\'Drake\'</span>');

    model.set('last', 'Bell');

    t.equal(html(), '<span>Bell, Drake</span>\n<span>Hello Drake Bell!</span>\n' +
        '<span>Username: DrakeBell</span>\n<span>\'Drake\'</span>');

    model.unset('first');

    t.equal(html(), '<span>Bell, </span>\n<span>Hello  Bell!</span>\n' +
        '<span>Username: Bell</span>\n<span>\'\'</span>');

    model.clear();

    t.equal(html(), '<span>, </span>\n<span>Hello  !</span>\n' +
        '<span>Username: </span>\n<span>\'\'</span>');
});
