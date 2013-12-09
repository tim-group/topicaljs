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

This will create the message bus and emit the initialise event which is passed to every module.  Therefore modules do whatever they want
at start up, such as fetch data via Ajax, or populate DOM elements, for example.

Module structure
----------------

A typical module looks like this:

```javascript
topical.MessageBusModule({
    name: "A descriptive name",
    subscribe: {
        initialise: function() {
            // do something at startup
        },
        eventType1: function() { 
            this.fireAnotherEventType(somedata);
        },
        eventType2: function() { 
            this.fireYetAnotherEventType(somedata, someotherdata);
            // or
            this.fire("yetAnotherEventType", somedata, someotherdata)
        }
    },
    // list of event types that this module can emit
    publish: ["anotherEventType", "yetAnotherEventType"]
}),
```