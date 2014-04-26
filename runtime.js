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
            if (config.listen) {
                el.fn = function(helpers, scope) {
                    el.nodeValue = fn(helpers, scope);
                };
                config.listen(el.fn, scope, element.fields, helpers);
            }
        } else {
            el = config.document.createElement(element.tag);
            _.forEach(element.attributes, function(value, attr) {
                if (attr === 'if') {
                    /* jshint evil: true */
                    el._if = new Function('return ' + value);
                    /* jshint evil: false */
                } else {
                    el.setAttribute(attr, value);
                }
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
    if (options.hasOwnProperty('binding')) {
        if (options.binding.hasOwnProperty('read')) {
            helpers.inject = options.binding.read;
        }
        if (options.binding.hasOwnProperty('listen')) {
            config.listen = options.binding.listen;
        }
    }
};

module.exports = runtime;
