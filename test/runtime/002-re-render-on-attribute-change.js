var _ = require('lodash');
var jsdom = require('jsdom').jsdom;
var test = require('tape');
var runtime = require('../../runtime.js');
var Model = require('backbone').Model;

test('reactive templates', function(t) {
    t.plan(5);

    runtime.set({
        document: jsdom('')
    });
    var template = require('../compiled/basic.json');
    var model = new Model();
    var tree = runtime(template, model);

    function html() {
        return _.reduce(tree.childNodes, function(str, child) {
            return str + (child.nodeValue || child.innerHTML);
        }, '');
    }

    t.equal(html(), ', \nHello  !\nUsername: \n\'\'');

    model.set('first', 'Drake');

    t.equal(html(), ', Drake\nHello Drake !\nUsername: Drake\n\'Drake\'');

    model.set('last', 'Bell');

    t.equal(html(), 'Bell, Drake\nHello Drake Bell!\nUsername: DrakeBell\n\'Drake\'');

    model.unset('first');

    t.equal(html(), 'Bell, \nHello  Bell!\nUsername: Bell\n\'\'');

    model.clear();

    t.equal(html(), ', \nHello  !\nUsername: \n\'\'');
});
