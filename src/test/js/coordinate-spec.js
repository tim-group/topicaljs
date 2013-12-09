"use strict";

describe("coordinate", function() {
    var busHolding = topical.TestUtils.busHolding,
        inspector = topical.TestUtils.inspector;
    
    it("coordinates one message and publishes it as another", busHolding(
        [topical.Coordinate({ expecting: "sourceEvent", publishing: "publishedEvent" }), inspector("publishedEvent")],
        function(republish, receiver, bus) {
            bus.fire("sourceEvent");

            expect(receiver.publishedEventReceived).toBe(true);
        })
    );

    it("coordinates more than one message and publishes them collectively as another", busHolding(
        [topical.Coordinate({ expecting: [ "sourceEvent1", "sourceEvent2" ], publishing: "publishedEvent" }), inspector("publishedEvent")],
        function(republish, receiver, bus) {
            bus.fire("sourceEvent1", "data1");
            bus.fire("sourceEvent2", "data2");

            expect(receiver.publishedEvent).toEqual({ sourceEvent1: "data1", sourceEvent2: "data2" });
        })
    );

    it("can be reused", busHolding(
        [topical.Coordinate({ expecting: [ "sourceEvent1", "sourceEvent2" ], publishing: "publishedEvent" }), inspector("publishedEvent")],
        function(republish, receiver, bus) {
            bus.fire("sourceEvent1", "data1");
            bus.fire("sourceEvent2", "data2");

            expect(receiver.publishedEvent).toEqual({ sourceEvent1: "data1", sourceEvent2: "data2" });

            bus.fire("sourceEvent1", "data3");
            bus.fire("sourceEvent2", "data4");

            expect(receiver.publishedEvent).toEqual({ sourceEvent1: "data3", sourceEvent2: "data4" });
        })
    );

    it("does not publish the event until all source events are received", busHolding(
        [topical.Coordinate({ expecting: [ "sourceEvent1", "sourceEvent2" ], publishing: "publishedEvent" }), inspector("publishedEvent")],
        function(republish, receiver, bus) {
            bus.fire("sourceEvent1", "data1");

            expect(receiver.publishedEventReceived).toBe(undefined);
        })
    );
});
