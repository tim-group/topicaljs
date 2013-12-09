"use strict";

describe("republish", function() {
    var busHolding = topical.TestUtils.busHolding,
        inspector = topical.TestUtils.inspector;

    it("republishes one message to another", busHolding(
        [topical.Republish({ subscribeTo: "sourceEvent", republishAs: "republishedEvent" }), inspector("republishedEvent")], 
        function(republish, receiver, bus) {
            bus.fire("sourceEvent");

            expect(receiver.republishedEventReceived).toBe(true);
        }
    ));
        
    it("sends the data from the original message in the republished message", busHolding(
        [topical.Republish({ subscribeTo: "sourceEvent", republishAs: "republishedEvent" }), inspector("republishedEvent")],
        function(republish, receiver, bus) {
            bus.fire("sourceEvent", "data");
            expect(receiver.republishedEvent).toBe("data");
        }
    ));

    it("multiple destination messages causes the sourceEvent message to be republished for each", busHolding(
        [topical.Republish({ subscribeTo: "sourceEvent", republishAs: ["republishedEvent", "otherRepublishedEvent"] }), inspector("republishedEvent"), inspector("otherRepublishedEvent")],
        function(republish, receiver, otherReceiver, bus) {
            bus.fire("sourceEvent", "data");
            
            expect(receiver.republishedEvent).toBe("data");
            expect(otherReceiver.otherRepublishedEvent).toBe("data");
        }
    ));

    it("multiple sourceEvent messages are received", busHolding(
        [topical.Republish({ subscribeTo: ["sourceEvent", "otherSourceEvent"], republishAs: "republishedEvent" }), inspector("republishedEvent")], 
        function(republish, receiver, bus) {
            bus.fire("sourceEvent", "data1");
            expect(receiver.republishedEvent).toBe("data1");

            bus.fire("otherSourceEvent", "data2");
            expect(receiver.republishedEvent).toBe("data2");
        }
    ));
});
