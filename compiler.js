var voidElements = require('./void-elements.js');

function ensureChildren(element) {
    if (!element.children) {
        element.children = [];
    }
}

function ensureAttributes(element) {
    if (!element.attributes) {
        element.attributes = {};
    }
}

function interpolate(text) {
    // TODO: Not sure about the linebreak fix, probably need to make a generic fix for escape characters
    var value = '\'' + text.replace(/\n/g, '\\n').replace(/'/g, '\\\'') + '\'';
    var fields = [];
    value = value.replace(/\{\{([^}]*)\}\}/g, function(matched, attr) {
        attr = attr.trim();
        fields.push(attr);
        return '\' + helpers.inject(scope, \'' + attr + '\') + \'';
    });
    value = value.replace(/^'' \+ /, '');
    value = value.replace(/ \+ ''$/, '');
    value = value.replace(/\+ '' \+/g, '+');
    var result = {
        value: value
    };
    if (fields.length > 0) {
        result.fields = fields;
    }
    return result;
}

function createHTMLNode(parent, text) {
    // TODO: Generate AST via esprima
    if (text[0] === '=') {
        text = text.substring(1);
    } else {
        createTextNode(parent, '{{' + text + '}}');
        return;
    }
    text = text.trim();
    var element = {
        tag: '#html',
        value: 'helpers.inject(scope, \'' + text + '\')',
        fields: [text]
    };
    ensureChildren(parent);
    parent.children.push(element);
}

function createTextNode(parent, text) {
    if (!text) { return; }
    var interpolated = interpolate(text);
    var element;
    if (interpolated.fields) {
        element = interpolated;
    } else {
        element = {
            value: text
        };
    }
    element.tag = '#text';
    ensureChildren(parent);
    parent.children.push(element);
}

function parse(parent, chars, i) {
    var text = '';
    // Parse markup
    var c;
    // Track to first opening bracket
    while ((c = chars[i++])) {
        if (c === '<') {
            createTextNode(parent, text);
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
                if (tagName !== parent.tag) {
                    // TODO: Test this
                    throw new Error('Parse error: Trying to close non-open tag (' + tagName + ')');
                }
                // TODO: Log notice about self-closing tags (both redundant end tag and self-closing)
                return ++i;
            }
            var el = {
                tag: tagName
            };
            ensureChildren(parent);
            parent.children.push(el);
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
                if (attributeName === 'repeat') {
                    if (el.hasOwnProperty(attributeName)) {
                        throw new Error('Parse error: multiple \'' + attributeName + '\' attributes detected');
                    }
                    el.repeat = attributeValue;
                } else {
                    ensureAttributes(el);
                    if (el.attributes.hasOwnProperty(attributeName)) {
                        // TODO: More tests
                        throw new Error('Parse error: multiple \'' + attributeName + '\' attributes detected');
                    }
                    var interpolated = interpolate(attributeValue);
                    if (interpolated.fields) {
                        el.attributes[attributeName] = interpolated;
                    } else {
                        el.attributes[attributeName] = attributeValue;
                    }
                }
                // Track to next non-whitespace character
                while (/\s/.test(c)) {
                    i++;
                    c = chars[i];
                }
            }
            i++;
            if (!voidElements.contains(tagName)) {
                // End of opening tag, move one level deeper
                i = parse(el, chars, i);
            }
        } else if (c === '{' && chars[i] === '{') {
            createTextNode(parent, text);
            text = '';
            i++;
            var int = '';
            while ((c = chars[i++]) !== '}') {
                int += c;
            }
            i++;
            createHTMLNode(parent, int);
        } else {
            text += c;
        }
    }
    createTextNode(parent, text);
    return i;
}

module.exports = function(string) {
    var root = {};
    parse(root, string.split(''), 0);
    return root.children || [];
};
