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
* Run tests in browser via testling
* Remove code in index.js + migrate old tests
* Interpolation in attributes
* `if` attribute
* `repeat` attribute