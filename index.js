var _ = require('lodash');
var selfClosingTags = _(['input', 'br']); // TODO

var config = {};

try {
    config.document = document;
} catch (e) {} // env: node.js

function createTextNode(root, text) {
    if (text) {
        var el = config.document.createTextNode(text);
        root.appendChild(el);
    }
}

function parse(root, chars, i) {
    var text = '';
    // Parse markup
    var c;
    // Track to first opening bracket
    while ((c = chars[i++])) {
        if (c === '<') {
            createTextNode(root, text);
            text = '';
            // Parse tag name
            var tagName = '';
            c = chars[i];
            var closing;
            if (c === '/') {
                closing = true;
                c = chars[++i];
            }
            while (!/\s/.test(c) && c !== '>') {
                tagName += c;
                i++;
                c = chars[i];
            }
            if (closing) {
                if (tagName !== root.nodeName.toLocaleLowerCase()) {
                    // TODO: Test this
                    throw new Error('Parse error: Trying to close non-open tag (' + tagName + ')');
                }
                // TODO: Log notice about self-closing tags (both redundant end tag and self-closing)
                return ++i;
            }
            var el = config.document.createElement(tagName);
            root.appendChild(el);
            // Track to next non-whitespace character
            while (/\s/.test(c)) {
                i++;
                c = chars[i];
            }
            while (c !== '>') {
                // Parse attributes
                var attributeName = '';
                while (!/\s/.test(c) && c !== '>' && c !== '=') {
                    attributeName += c;
                    i++;
                    c = chars[i];
                }
                var attributeValue = '';
                if (/\s/.test(c) || c === '>') {
                    // Property, no value to parse
                    attributeValue = attributeName;
                } else if (c === '=') {
                    // Check the spec if un-quoted attribute values are allowed
                    i++;
                    c = chars[i];
                    if (c === '"') {
                        i++;
                        c = chars[i];
                        while (c !== '"') {
                            attributeValue += c;
                            i++;
                            c = chars[i];
                        }
                        i++;
                        c = chars[i];
                    } else {
                        while (!/\s/.test(c) && c !== '>') {
                            attributeValue += c;
                            i++;
                            c = chars[i];
                        }
                    }
                }
                if (attributeName === 'if') {
                    if (el.hasOwnProperty('_if')) {
                        throw new Error('Parse error: multiple \'if\' attributes detected');
                    }
                    /* jshint ignore:start */
                    el._if = function() {
                        return eval(attributeValue);
                    };
                    /* jshint ignore:end */
                } else {
                    el.setAttribute(attributeName, attributeValue);
                }
                // Track to next non-whitespace character
                while (/\s/.test(c)) {
                    i++;
                    c = chars[i];
                }
            }
            i++;
            if (!selfClosingTags.contains(tagName)) {
                // End of opening tag, move one level deeper
                i = parse(el, chars, i);
            }
        } else {
            text += c;
        }
    }
    createTextNode(root, text);
    return i;
}

function template(string) {
    var doc = config.document;
    var nodeList = doc.createDocumentFragment();
    parse(nodeList, string.split(''), 0);
    var ret = function() {
        console.log(string);
    };
    ret.tree = nodeList.childNodes;
    return ret;
}

template.set = function(options) {
    if (options.hasOwnProperty('document')) {
        config.document = options.document;
    }
};

template._config = config;

module.exports = template;
