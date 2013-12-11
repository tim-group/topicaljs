TopicalJS
=========

TopicalJS is a JavaScript Publish/Subscribe message exchange system.  It can be used to declaratively program and coordinate the events 
being passed in your system.  TopicalJS has no dependencies and can be used either on the server- or client-side.  At TIMGroup, we use it
to coordinate both events being raised in the UI as well as data returning via Ajax.

TopicalJS is not an Ajax engine and it doesn't explicitly provide event hooks for standard UI components.  Its key benefit is the 
declarative layout of what events can be emitted by the system, and what components react to those events and when.

How it works
============

TopicalJS provides a message bus.  Multiple message busses can be created, but things are less confusing when you only have one.  This 
message bus operates exactly like an ethernet network.  Messages sent on the bus are sent to every module on the bus with only those modules
expressing an interest in the message reacting to it, where others can ignore it.

Events consist of an event name, which can be any name you choose, and optionally contain one or more data components, which themselves can
be arrays or maps.

How to use it
=============

If being used in a browser, include the topical.js script as a script.

```html
<script type="text/javascript" src="topical.js"></script>
```

When you are ready, you can invoke the function that will create you message bus.  In this example, we're using jQuery to kick things off.

```javascript
$(document).ready(function() { topical.MessageBus(module1, module2, ..., moduleN); });
```

This will create the message bus and emit the init event which is passed to every module.  Therefore modules do whatever they want
at start up, such as fetch data via Ajax, or populate DOM elements, for example.

Module structure
----------------

A typical module looks like this:

```javascript
topical.MessageBusModule({
    name: "A descriptive name",
    subscribe: {
        init: function() {
            // do something at startup
        },
        eventType1: function() { 
            this.fireAnotherEventType(somedata);
        },
        eventType2: function(inputdata) { 
            this.fireYetAnotherEventType(somedata, someotherdata);
            // or
            this.fire("yetAnotherEventType", somedata, someotherdata)
        }
    },
    // list of event types that this module can emit
    publish: ["anotherEventType", "yetAnotherEventType"]
}),
```

Note that eventTypeTwo is fired with an inputdata event object which can contain information relevant to the event.  For example, if the
event is emitted as a result of the Ajax call, this could be the data contained in the response.


Generic Modules
---------------

Modules can be customized and reused.  We have provided two default ones which can be use to create a declarative event passing system.

Republishing
------------

For semantic or practical purposes, it can be useful to republish certain events.  For example, on init, you might want to clear
out any potentially resident DOM object state.  So, you could republish init as clear, for example:

```javascript
topical.Republish({ subscribeTo: "init", republishAs: [ "clear"] });
```

Note that the subscribeTo and republishAs keys can have either a single string or array of strings for the value.  In this way to can create
multiple events from a single event name, or publish the same event or set of events based on a range of input events.

Coordination
------------ 

Sometimes you only want something to happen once a number of other events have occured.  This is what the Coordinator does.  It waits until
a set of events have completed, and then fires its own event collating all the data from the events it subscribed to.  Once it publishes 
its collation event, it resets its state and starts gathering new events again.

```javascript
topical.Coordinate({ expecting: ["eventOne", "eventTwo"], publishing: "bothEventsHaveHappened" }),

```

Once eventOne and eventTwo have fired, a new event "bothEventsHaveHappened" is emitted with a single data object containing the data from 
both the consumed events named according to their event names.  Therefore the handler for this event would look like this:

```javascript
subscribe: {
    bothEventsHaveHappened: function(data) {
        data.eventOne; // the data associated with eventOne, if any, and
        data.eventTwo; // the data associated with eventTwo, if any.
    }
}
```

Worked example
==============

An example of TopicalJS in action can be found in the example folder.

Testing
=======

We provide two utilities for testing: an "inspector" for checking what events and data are fired, and a function to call to wrap your tests
and provide a bus containing the specified modules.  This is compatible with Jasmine JS testing.

```javascript
describe("TopicalJS", function() {
    it("can be tested with Jasmine", topical.TestUtils.busHolding(
        [moduleUnderTest, topical.TestUtils.inspector("publishedEvent")],
        function(moduleUnderTest, inspector, bus) {
            bus.fire("sourceEvent");

            expect(inspector.publishedEventReceived).toBe(true);
            expect(inspector.publishedEvent).toEqual("dataPublishedByModuleUnderTest");
        })
    );
});
```

In this example "busHolding" returns a function that will be executed by Jasmine and which should contain your assertions.  busHolding takes
a list of modules which will typically just be the one under test, or more, if you're testing interactions, and a function to call.  This
function will take the modules under test arguments.  One module that can be added to the bus is the "inspector", which will record an event
type and which can be interrogated.  So if your module raises event, the inspector can be used to check that they are indeed raised.

Contributing
============
We would love your feedback and contribution to this project.  Please feel free to make Pull Requests for new awesome generic modules you 
might invent.
