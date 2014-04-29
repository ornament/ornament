#TODO
* Warn when encountering closing tag for void elements
* Collapse subsequent text nodes
* Create serializable AST from markup, dump to file(?), then parse and create actual dom once template is rendered
* Decide a baseline compatibility threshold (ES5/IE9?)
* Figure out how to parse expressions (eval/function, AST (esprima.org), custom?)
* Extract event listener logic and pair with template change events, i.e. 'ornament-bind-*' (example: 'ornament-bind-backbone')
* Figure out how to handle mixed models (e.g. POJO + Backbone.Model). Possibly sniff types somehow?
* Interpolation in attributes
* `if` attribute (should this include interpolation? if="{{condition}}" vs. if="condition")
* Reactive `repeat` support
* Ability to reference parent scope (needed for `repeat`)
* Rename `inject`
* Throw descriptive message if `document` is missing, linking to Node.js usage docs
* Reduce usage of external dependencies (e.g. reduce `lodash` to specific methods if is saves runtime space)
* Code coverage