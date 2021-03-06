var _ = require('lodash');

function createValueFn(element, scope) {
    // TODO: Investigate if doing a dirty-check against the
    // DOM is cheap enough to prevent unnecessary updates
    if (element.expression) {
        /* jshint evil: true */
        return _.bind(new Function('helpers', 'return ' + element.expression), scope);
        /* jshint evil: false */
    } else {
        var args = element.fields[0].slice(0);
        args.unshift(scope);
        return function(helpers) {
            return helpers.read.apply(null, args);
        };
    }
}

function insertNode(parent, node, index) {
    var children = parent.childNodes;
    // TODO: Needs to not be affected by sibling's `if` result
    if (index === children.length) {
        parent.appendChild(node);
    } else {
        parent.insertBefore(node, children[index]);
    }
}

function createTextNode(root, element, scope, config, indexOffset, createFn) {
    var el;
    if (element.fields || element.expression) {
        var fn = createValueFn(element, scope);
        el = config.document[createFn]('');
        var value = function(helpers) {
            el.nodeValue = fn(helpers);
        };
        value(config);
        if (config.listen) {
            config.listen(value, scope, element.fields, config);
        }
    } else {
        el = config.document[createFn](element.value);
    }
    insertNode(root, el, indexOffset);
    return indexOffset + 1;
}

function createHTMLNode(root, element, scope, config, indexOffset) {
    var fn = createValueFn(element, scope);
    var kids;
    var container = config.document.createElement('div');
    var addNodes = function(helpers) {
        _.forEach(kids, function(node) {
            root.removeChild(node);
        });
        container.innerHTML = fn(helpers);
        // nodeList is live and only array-like
        kids = _.toArray(container.childNodes);
        _.forEach(kids, function(node, index) {
            insertNode(root, node, index + indexOffset);
        });
    };
    addNodes(config);
    if (config.listen) {
        config.listen(addNodes, scope, element.fields, config);
    }
    return indexOffset + kids.length;
}

function createNodeList(root, element, scope, config, indexOffset) {
    var collection = createValueFn(element.repeat, scope)(config);
    var items = config.collection(collection);
    if (_.isFunction(config.listenToCollection)) {
        var add = function(item, index) {
            createElement(root, elm, item, config, index + indexOffset);
        };
        var remove = function(item, index) {
            index += indexOffset;
            // TODO: Needs to keep reference to actual DOM node
            root.removeChild(root.childNodes[index]);
        };
        config.listenToCollection(collection, add, remove);
    }
    var elm = _.omit(element, 'repeat');
    _.forEach(items, function(item, index) {
        createElement(root, elm, item, config, index + indexOffset);
    });
    return indexOffset + items.length;
}

function createNode(root, element, scope, config, indexOffset) {
    var el = config.document.createElement(element.tag);
    _.forEach(element.attributes, function(value, attr) {
        if (attr === 'if') {
            /* jshint evil: true */
            el._if = new Function('return ' + value);
            /* jshint evil: false */
        } else {
            if (_.isString(value)) {
                el.setAttribute(attr, value);
            } else {
                var fn = createValueFn(value, scope);
                el.setAttribute(attr, fn(config));
                if (config.listen) {
                    var onChange = function(helpers) {
                        var value = String(fn(helpers));
                        if (el.getAttribute(attr) !== value) {
                            el.setAttribute(attr, value);
                        }
                    };
                    config.listen(onChange, scope, value.fields, config);
                }
                if (config.listen &&
                    !value.expression && // Prevent illegal bindings
                    element.tag === 'input') {
                    // TODO: Should probably fall back to 'change' for 'select' and 'keygen'
                    var eventName = 'oninput' in el ? 'input' : 'keyup';
                    var parse = _.identity;
                    if (element.parse) {
                        /* jshint evil: true */
                        parse = new Function('value', 'return ' + element.parse);
                        /* jshint evil: false */
                    }
                    el.addEventListener(eventName, function(event) {
                        var val = parse(event.target.value);
                        var args = [val, scope].concat(value.fields[0]);
                        config.write.apply(null, args);
                    });
                }
            }
        }
    });
    createElements(el, element.children, scope, config);
    insertNode(root, el, indexOffset);
    return indexOffset + 1;
}

function createElement(root, element, scope, config, indexOffset) {
    if (element.tag === '#text') {
        return createTextNode(root, element, scope, config, indexOffset, 'createTextNode');
    } else if (element.tag === '#comment') {
        return createTextNode(root, element, scope, config, indexOffset, 'createComment');
    } else if (element.tag === '#html') {
        return createHTMLNode(root, element, scope, config, indexOffset);
    } else if (element.repeat) {
        return createNodeList(root, element, scope, config, indexOffset);
    } else {
        return createNode(root, element, scope, config, indexOffset);
    }
}

function createElements(root, elements, scope, config) {
    var indexOffset = 0;
    _.forEach(elements, function(element) {
        indexOffset = createElement(root, element, scope, config, indexOffset);
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
    read: function(scope) {
        var attributes = _.rest(arguments);
        var value = _.reduce(attributes, function(scope, attr) {
            if (!scope) { return scope; }
            return scope[attr];
        }, scope);
        return value === undefined ? '' : value;
    },
    write: function(value, scope) {
        var attributes = _.rest(arguments, 2);
        var attr = attributes.pop();
        scope = _.reduce(attributes, function(scope, attr) {
            if (!scope) { return scope; }
            return scope[attr];
        }, scope);
        scope[attr] = value;
    },
    collection: _.identity // TODO: Should defer to `read()`
};
try {
    config.document = document;
} catch (e) {} // env: Node.js

runtime.settings = {};

module.exports = runtime;
