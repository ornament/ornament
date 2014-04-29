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