#TODO
* Warn when encountering closing tag for void elements
* Collapse subsequent text nodes
* Option to remove text nodes containing only whitespace
* Create serializable AST from markup, dump to file(?), then parse and create actual dom once template is rendered
* Decide a baseline compatibility threshold (ES5/IE9?)
* Figure out how to parse expressions (eval/function, AST (esprima.org), custom?)
* Extract event listener logic and pair with template change events, i.e. 'ornament-bind-*' (example: 'ornament-bind-backbone')
* Figure out how to handle mixed models (e.g. POJO + Backbone.Model). Possibly sniff types somehow?
* `if` attribute (should this include interpolation? if="{{condition}}" vs. if="condition")
* Ability to reference parent scope (needed for `repeat`), possibly solved by `parent` argument?
* Throw descriptive message if `document` is missing, linking to Node.js usage docs
* Reduce usage of external dependencies (e.g. reduce `lodash` to specific methods if is saves runtime space)
* Code coverage
* Batch/queue change events and execute on next tick (+ option to force immediate for testing; consider promise/callback for notifications about changes to the DOM)
* Consider rAF for timing DOM updates
* Handle autofocus somehow, possibly via <div focus="message.length === 0">
* Decide which template file extension to use (.orn? https://github.com/github/linguist/blob/master/lib/linguist/languages.yml)
* Add 'filters' (mutators/modifiers/whatever), e.g. {{timestampString | moment}} OR just do it with imports + expressions
* Run tests on travis and testling
* Add 'strict' mode to parser: http://w3c.github.io/elements-of-html/
* JSCS JSDoc
* Make runtime return a Ornament instance instead of a documentFragment. Add `appendTo()` and `destroy()`