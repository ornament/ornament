var _ = require('lodash');

function createElement(root, element, scope, config) {
    var el;
    if (element.tag === '#text') {
        /* jshint evil: true */
        var fn = new Function('helpers', 'scope', 'return ' + element.value);
        /* jshint evil: false */
        el = config.document.createTextNode(fn(config, scope));
        if (config.listen) {
            el.fn = function(helpers, scope) {
                el.nodeValue = fn(helpers, scope);
            };
            config.listen(el.fn, scope, element.fields, config);
        }
    } else {
        el = config.document.createElement(element.tag);
        _.forEach(element.attributes, function(value, attr) {
            if (attr === 'if') {
                /* jshint evil: true */
                el._if = new Function('return ' + value);
                /* jshint evil: false */
            } else if (attr === 'repeat') {
                var collection = config.inject(scope, value);
                var items = config.collection(collection);
                if (_.isFunction(config.listenToCollection)) {
                    el.add = function(item, index) {
                        var el = createElement(root, elm, item, config);
                        if (el) {
                            var children = root.children;
                            if (index === children.length) {
                                root.appendChild(el);
                            } else {
                                root.insertBefore(el, children[index]);
                            }
                        }
                    };
                    config.listenToCollection(collection, el.add);
                }
                var elm = _.cloneDeep(element); // TODO: Lift `repeat` to top level
                delete elm.attributes.repeat;
                _.forEach(items, function(item) {
                    var el = createElement(root, elm, item, config);
                    if (el) {
                        root.appendChild(el);
                    }
                });
                el = undefined;
            } else {
                el.setAttribute(attr, value);
            }
        });
        if (el) {
            createElements(el, element.children, scope, config);
        }
    }
    return el;
}

function createElements(root, elements, scope, config) {
    _.forEach(elements, function(element) {
        var el = createElement(root, element, scope, config);
        if (el) {
            root.appendChild(el);
        }
    });
}

function runtime(template, scope) {
    var cfg = _.defaults({}, runtime.settings, config);
    var doc = cfg.document;
    var nodeList = doc.createDocumentFragment();
    createElements(nodeList, template, scope, cfg);
    return nodeList;
}

var config = {
    inject: function(scope, attribute) {
        var value = scope[attribute];
        return value === undefined ? '' : value;
    },
    collection: _.identity
};
try {
    config.document = document;
} catch (e) {} // env: Node.js

runtime.settings = {};

module.exports = runtime;
