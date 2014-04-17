var _ = require('lodash');

var helpers = {
    inject: function(scope, attribute) {
        var value = scope[attribute];
        return value === undefined ? '' : value;
    }
};

function createElements(root, elements, scope) {
    _.forEach(elements, function(element) {
        var el;
        if (element.tag === '#text') {
            /* jshint evil: true */
            var fn = new Function('helpers', 'scope', 'return ' + element.value);
            /* jshint evil: false */
            el = config.document.createTextNode(fn(helpers, scope));
            el.fn = fn;
        } else {
            el = config.document.createElement(element.tag);
            _.forEach(element.attributes, function(attr, value) {
                // TODO: Test me
                el.setAttribute(value, attr);
            });
            createElements(el, element.children, scope);
        }
        root.appendChild(el);
    });
}

function runtime(template, scope) {
    var doc = config.document;
    var nodeList = doc.createDocumentFragment();
    createElements(nodeList, template, scope);
    return nodeList;
}

var config = {};
try {
    config.document = document;
} catch (e) {} // env: Node.js

runtime.set = function(options) {
    if (options.hasOwnProperty('document')) {
        config.document = options.document;
    }
};

module.exports = runtime;
