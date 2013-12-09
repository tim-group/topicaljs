"use strict";

describe("topical", function() {
    it("subscription methods are called in the context of the module", function() {
        var bus = topical.MessageBus(), 
            firedContext = null, 
            subscriber = topical.MessageBusModule({
            subscribe : {
                "stuff" : function(data) {
                    firedContext = this;
                }
            }
        });

        bus.addModule(subscriber);
        bus.fire("stuff", {});

        expect(firedContext).toBe(subscriber);
    });
    
    it("can fire a list of arguments, not just one map", function() {
        var bus = topical.MessageBus(),
            firstArg = null,
            secondArg = null,
            thirdArg = null,
            subscriber = topical.MessageBusModule({
                subscribe: { "stuff": function(first, second, third) { firstArg = first; secondArg = second; thirdArg = third; } }
            });
        
        bus.addModule(subscriber);
        bus.fire("stuff", 1, "hello", {a: "yes"});
        
        expect(firstArg).toBe(1);
        expect(secondArg).toBe("hello");
        expect(thirdArg).toEqual({a: "yes"});
    });
    
    it("can fire a list of arguments by calling the fire function, not just one map", function() {
        var bus = topical.MessageBus(),
            firstArg = null,
            secondArg = null,
            thirdArg = null,
            subscriber = topical.MessageBusModule({
                subscribe: { "stuff": function(first, second, third) { firstArg = first; secondArg = second; thirdArg = third; },
                             "start": function() { this.fireStuff(1, "hello", {a: "yes"}); } },
                publish: ["stuff"]
            });

        bus.addModule(subscriber);
        bus.fire("start", 1, "hello", {a: "yes"});

        expect(firstArg).toBe(1);
        expect(secondArg).toBe("hello");
        expect(thirdArg).toEqual({a: "yes"});
    });
    
    it("connects one publisher of one thing with one subscriber of the same thing", function() {
        var bus = topical.MessageBus(),
            received = null,
            publisher = topical.MessageBusModule({
                publish: ["stuff"]
            }),
            subscriber = topical.MessageBusModule({
                subscribe: { "stuff": function(data) { received = data; } }
            });

        bus.addModule(publisher);
        bus.addModule(subscriber);
        publisher.fireStuff("info");

        expect(received).toBe("info");
    });

    it("connects one publisher of several things with one subscriber of one of those things", function() {
        var bus = topical.MessageBus(),
            received = "nothing",
            publisher = topical.MessageBusModule({
                publish: ["stuff", "things"]
            }),
            subscriber = topical.MessageBusModule({
                subscribe: { "stuff": function(data) { received = data; } }
            });

        bus.addModule(publisher);
        bus.addModule(subscriber);

        publisher.fireThings("info");
        expect(received).toBe("nothing");

        publisher.fireStuff("info");
        expect(received).toBe("info");
    });

    it("connects two publisher of several things with one subscriber of one of those things", function() {
        var bus = topical.MessageBus(),
            received = "nothing",
            publisher = topical.MessageBusModule({
                publish: ["stuff", "things"]
            }),
            publisherTwo = topical.MessageBusModule({
                publish: ["stuff", "things"]
            }),
            subscriber = topical.MessageBusModule({
                subscribe: { "stuff": function(data) { received = data; } }
            });

        bus.addModules([publisher, publisherTwo, subscriber]);

        publisher.fireThings("info");
        expect(received).toBe("nothing");

        publisherTwo.fireThings("info");
        expect(received).toBe("nothing");

        publisher.fireStuff("info");
        expect(received).toBe("info");

        publisherTwo.fireStuff("infoTwo");
        expect(received).toBe("infoTwo");
    });

    it("connects one publisher of one thing with two subscribers of the same thing", function() {
        var bus = topical.MessageBus(),
            received = "nothing",
            receivedTwo = "nothing",
            publisher = topical.MessageBusModule({
                publish: ["stuff"]
            }),
            subscriber = topical.MessageBusModule({
                subscribe: { "stuff": function(data) { received = data; } }
            }),
            subscriberTwo = topical.MessageBusModule({
                subscribe: { "stuff": function(data) { receivedTwo = data; } }
            });

        bus.addModules([publisher, subscriber, subscriberTwo]);

        expect(received).toBe("nothing");
        expect(receivedTwo).toBe("nothing");

        publisher.fireStuff("info");
        expect(received).toBe("info");
        expect(receivedTwo).toBe("info");
    });

    it("connects two publishers with one subscriber of both", function() {
        var bus = topical.MessageBus(),
            received = "nothing",
            receivedTwo = "nothing",
            publisher = topical.MessageBusModule({
                publish: ["stuff"]
            }),
            publisherTwo = topical.MessageBusModule({
                publish: ["things"]
            }),
            subscriber = topical.MessageBusModule({
                subscribe: { "stuff": function(data) { received = data; },
                             "things": function(data) { receivedTwo = data; } }
            });

        bus.addModules([publisher, publisherTwo, subscriber]);

        expect(received).toBe("nothing");
        expect(receivedTwo).toBe("nothing");

        publisher.fireStuff("info");
        expect(received).toBe("info");
        expect(receivedTwo).toBe("nothing");

        publisherTwo.fireThings("outfo");
        expect(receivedTwo).toBe("outfo");
    });

    it("will pass unsubscribed messages to a catcher module", function() {
        var bus = topical.MessageBus(),
            caughtTopic = "",
            caughtData = "",
            catcherFunction = function(topic, data) {
                caughtTopic = topic;
                caughtData = data;
            };

        bus.setCatcher(catcherFunction);

        bus.addModule(topical.MessageBusModule({ subscribe: { "topic2": function(){} } }));

        bus.fire("topic2", "data2");
        expect(caughtTopic).toBe("");
        expect(caughtData).toBe("");
        
        bus.fire("topic1", "data1");
        expect(caughtTopic).toBe("topic1");
        expect(caughtData).toBe("data1");
    });

    it("after adding a module a module added message is published", function() {
        var bus = topical.MessageBus(),
            moduleOne = topical.MessageBusModule({subscribe: {}}),
            received = "nothing",
            subscriber = topical.MessageBusModule({
                subscribe: { "moduleAdded": function(data) { received = data; } }
            });

        bus.addModule(subscriber);
        bus.addModule(moduleOne);

        expect(received).toBe(moduleOne);
    });

    it("a module can hear itself being added", function() {
        var bus = topical.MessageBus(),
            received = "nothing",
            subscriber = topical.MessageBusModule({
                subscribe: { "moduleAdded": function(data) { received = data; } }
            });

        bus.addModule(subscriber);

        expect(received).toBe(subscriber);
    });

    it("module added messages will not be caught", function() {
        var bus = topical.MessageBus(),
            caughtSomething = false,
            catcherFunction = function(topic, data) {
                caughtSomething = true;
            },
            subscriber = topical.MessageBusModule({subscribe: {}});

        bus.setCatcher(catcherFunction);
        bus.addModule(subscriber);

        expect(caughtSomething).toBe(false);
    });

    it("fires an initialisation message", function() {
        var initialise = jasmine.createSpy(),
            module = function() {
                return topical.MessageBusModule({
                    subscribe: {
                        "initialise": initialise
                    }
                });
            };

        topical.MessageBus( module() );

        expect(initialise).toHaveBeenCalled();
    });

    it("adds all modules passed in constructor to the bus", function() {
        var received1 = "nothing",
            received2 = "nothing",
            module = topical.MessageBusModule({subscribe: {}}),
            subscriber1 = topical.MessageBusModule({
                subscribe: { "moduleAdded": function(data) { received1 = data; } }
            }),
            subscriber2 = topical.MessageBusModule({
                subscribe: { "moduleAdded": function(data) { received2 = data; } }
            }),
            bus = topical.MessageBus(subscriber1, subscriber2);

        bus.addModule(module);
        
        expect(received1).toBe(module);
        expect(received2).toBe(module);
    });
});
