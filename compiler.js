var _ = require('lodash');
var esprima = require('esprima');
var escodegen = require('escodegen');
var types = require('ast-types');
var namedTypes = types.namedTypes;
var builders = types.builders;
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

function isSingleMemberExpression(program) {
    var body = program.body;
    return body.length === 1 &&
        namedTypes.ExpressionStatement.check(body[0]) &&
        namedTypes.MemberExpression.check(body[0].expression);
}

function interpolate(text) {
    // TODO: Not sure about the linebreak fix, probably need to make a generic fix for escape characters
    var value = '\'' + text.replace(/\n/g, '\\n').replace(/'/g, '\\\'') + '\'';
    var fields = [];
    var expressionCount = 0;
    value = value.replace(/\{\{([^}]*)\}\}/g, function(matched, expression) {
        // TODO: Disallow multiple statements (causes problem with 'return' prefix in runtime#createValueFn
        expressionCount++;
        expression = expression.replace(/\\'/g, '\''); // TODO
        var ast = esprima.parse(expression);
        // Check this before mutating AST
        var isSingleMember = isSingleMemberExpression(ast);
        types.traverse(ast, function(node) {
            if (namedTypes.MemberExpression.check(node)) {
                if (namedTypes.CallExpression.check(this.parent.node) &&
                    this.parent.node.callee === node) {
                    return false;
                }
                var field = [];
                var isThisExpression = false;
                types.traverse(node, function(n) {
                    if (namedTypes.ThisExpression.check(n)) {
                        isThisExpression = true;
                    } else if (namedTypes.Literal.check(n)) {
                        field.push(n.value);
                    } else if (namedTypes.Identifier.check(n)) {
                        field.push(n.name);
                    }
                });
                if (isThisExpression) {
                    fields.push(field);
                    var callee = builders.memberExpression(
                        builders.identifier('helpers'),
                        builders.identifier('read'),
                        false
                    );
                    var args = _.map(field, builders.literal);
                    args.unshift(builders.thisExpression());
                    var replacement = builders.callExpression(callee, args);
                    _.assign(node, replacement);
                }
                return false;
            }
        });
        if (isSingleMember) {
            return '';
        }
        return '\' + ' + escodegen.generate(ast) + ' + \'';
    });
    value = value.replace(/^''$/, '');
    value = value.replace(/^'' \+ /, '');
    value = value.replace(/ \+ ''$/, '');
    value = value.replace(/\+ '' \+/g, '+');
    if (expressionCount > 0) {
        var result = {};
        if (value) {
            result.expression = value;
        }
        if (!_.isEmpty(fields)) {
            result.fields = fields;
        }
        return result;
    }
}

function createHTMLNode(parent, text) {
    if (text[0] === '=') {
        text = text.substring(1);
    } else {
        createTextNode(parent, '{{' + text + '}}'); // TODO
        return;
    }
    var element = interpolate('{{' + text + '}}'); // TODO
    element.tag = '#html';
    ensureChildren(parent);
    parent.children.push(element);
}

function createTextNode(parent, text) {
    if (!text) { return; }
    var element = interpolate(text);
    if (!element) {
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
                    el.repeat = interpolate('{{' + attributeValue + '}}'); // TODO
                } else {
                    ensureAttributes(el);
                    if (el.attributes.hasOwnProperty(attributeName)) {
                        // TODO: More tests
                        throw new Error('Parse error: multiple \'' + attributeName + '\' attributes detected');
                    }
                    var interpolated = interpolate(attributeValue);
                    el.attributes[attributeName] = interpolated || attributeValue;
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
