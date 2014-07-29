var _ = require('lodash');
var esprima = require('esprima');
var escodegen = require('escodegen');
var types = require('ast-types');
var namedTypes = types.namedTypes;
var builders = types.builders;
var voidElements = require('./void-elements.js');
var decode = (new (require('html-entities').AllHtmlEntities)()).decode;

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

function isSingleExpressionProgram(program) {
    var body = program.body;
    return body.length === 1 &&
        namedTypes.ExpressionStatement.check(body[0]);
}

function isMemberOrThisExpression(node) {
    return namedTypes.MemberExpression.check(node) ||
        namedTypes.ThisExpression.check(node);
}

function isSingleMemberExpression(program) {
    var body = program.body;
    return isSingleExpressionProgram(program) &&
        isMemberOrThisExpression(body[0].expression);
}

function isSingleStringLiteralExpression(program) {
    var body = program.body;
    return isSingleExpressionProgram(program) &&
        namedTypes.Literal.check(body[0].expression) &&
        _.isString(body[0].expression.value);
}

// TODO: Optional `ast` argument
function parseExpression(expression) {
    // TODO: Disallow multiple statements (causes problem with 'return' prefix in runtime#createValueFn
    // TODO: This will throw on illegal expressions, handle
    var ast = esprima.parse(expression);
    // Check this before mutating AST
    var isSingleMember = isSingleMemberExpression(ast);
    var fields = [];
    types.traverse(ast, function(node) {
        if (isMemberOrThisExpression(node)) {
            if (namedTypes.CallExpression.check(this.parent.node) &&
                this.parent.node.callee === node) {
                return false;
            }
            var field = [];
            var isThisExpression = false;
            types.traverse(node, function(n) {
                if (namedTypes.CallExpression.check(n)) {
                    return false;
                } else if (namedTypes.ThisExpression.check(n)) {
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
    var result = {};
    if (!_.isEmpty(fields)) { result.fields = fields; }
    if (!isSingleMember || _.isEmpty(fields)) { result.expression = escodegen.generate(ast); }
    return result;
}

function interpolate(text) {
    var chars = text.split('');
    var i = 0;
    var c;
    var statement = '';
    var expression = '';
    var open = false;
    while ((c = chars[i++])) {
        if (c === '{' && chars[i] === '{') {
            i++;
            if (statement) {
                if (expression) {
                    expression += ' + ';
                }
                expression += JSON.stringify(statement);
            }
            statement = '';
            open = true;
        } else if (open && c === '}' && chars[i] === '}') {
            i++;
            if (statement) {
                statement = statement.replace(/;\s*$/, '');
                if (expression) {
                    expression += ' + ';
                }
                expression += '(' + statement + ')';
            }
            statement = '';
            open = false;
        } else {
            statement += c;
        }
    }
    if (statement) {
        if (expression) {
            expression += ' + ';
        }
        expression += JSON.stringify(statement);
    }
    var ast = esprima.parse(expression);
    if (isSingleStringLiteralExpression(ast)) {
        return text;
    } else {
        return parseExpression(expression);
    }
}

function createInterpolationNode(parent, text) {
    var tag = '#text';
    if (text[0] === '=') {
        text = text.substring(1);
        tag = '#html';
    }
    var element = parseExpression(text);
    element.tag = tag;
    ensureChildren(parent);
    parent.children.push(element);
}

function createTextNode(parent, text) {
    if (!text) { return; }
    var element = {
        tag: '#text',
        value: decode(text)
    };
    ensureChildren(parent);
    parent.children.push(element);
}

function createCommentNode(parent, chars, offset) {
    var c;
    var text = '';
    while ((c = chars[offset++])) {
        text += c;
        if (c === '>' && chars[offset - 2] === '-' && chars[offset - 3] === '-') {
            ensureChildren(parent);
            var element = interpolate(text.substr(0, text.length - 3));
            if (_.isString(element)) {
                parent.children.push({
                    tag: '#comment',
                    value: element
                });
            } else {
                element.tag = '#comment';
                parent.children.push(element);
            }
            return offset;
        }
    }
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
            if (c === '!' && chars[i + 1] === '-' && chars[i + 2] === '-') {
                i = createCommentNode(parent, chars, i + 3);
                continue;
            }
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
                    el.repeat = parseExpression(attributeValue);
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
            createInterpolationNode(parent, int);
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
