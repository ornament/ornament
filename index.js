var config = {};

try {
    config.document = document;
} catch (e) {} // env: node.js

function template(string) {
    var chars = string.split('');
    var tree = [];
    // Parse markup
    var i = 0;
    // Track to next non-whitespace character
    while (/\s/.test(chars[i])) {
        i++;
    }
    var c = chars[i];
    i++;
    if (c === '<') {
        // Parse tag name
        var tagName = '';
        c = chars[i];
        while (!/\s/.test(c) && c !== '>') {
            tagName += c;
            i++;
            c = chars[i];
        }
        var el = config.document.createElement(tagName);
        tree.push(el);
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
            el.setAttribute(attributeName, attributeValue);
            // Track to next non-whitespace character
            while (/\s/.test(c)) {
                i++;
                c = chars[i];
            }
        }
    }
    var ret = function() {
        console.log(chars);
    };
    ret.tree = tree;
    return ret;
}

template.set = function(options) {
    if (options.hasOwnProperty('document')) {
        config.document = options.document;
    }
};

template._config = config;

module.exports = template;
