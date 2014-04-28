#ornament
TODO

#Motivation
TODO
* Angular ("just works", monolithic, lots of assumptions)
* Backbone (models and collections are great; views are lacking)
* Should be able to do all markup/view related logic in the template, and keep the business logic in the (view) controller

#Goals
TODO
* Plugable models (Object.observe, Backbone.Model, EventEmitter, POJO (change polling))
* To way binding of models to views
* Works both frontend and backend

#Discussion
* Should there be smart logic for handling assigning listeners to events in the template (example: '<button onclick="doSomething()">Submit</button>')

#TODO
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