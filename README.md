TopicalJS
=========

TopicalJS is a JavaScript Publish/Subscribe message exchange system.  It can be used to declaratively program and coordinate the events 
being passed in your system.  TopicalJS has no dependencies and can be used either on the server- or client-side.  At TIMGroup, we use it
to coordinate both events being raised in the UI as well as data returning via Ajax.

TopicalJS is not an Ajax engine and it doesn't explicitly provide event hooks for standard UI components.  Its key benefit is the 
declarative layout of what events can be emitted by the system, and what components react to those events and when.

How to use it
=============

If being used in a browser, include the topical.js script as a script.

```html
<script type="text/javascript" src="topical.js"></script>
```