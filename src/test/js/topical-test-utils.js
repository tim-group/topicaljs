"use strict";

topical.TestUtils = {
    inspector: function(messageName) {
        var subscriptions = {},
            self = {};

        subscriptions.moduleAdded = function(module) {
            if (module === this) {
                delete this[messageName + 'Received'];
                delete this[messageName];
            }
        };
        
        subscriptions[messageName] = function(data) {
            this[messageName + 'Received'] = true;
            this[messageName] = data;
        };
        self[messageName + 'Received'] = false;
        self[messageName] = undefined;

        self.subscribe = subscriptions;

        return topical.MessageBusModule(self);
    },

    busHolding: function(modules, test) {
        return function() {
            var bus = topical.MessageBus(),
                args,
                i;

            for (i = 0; i < modules.length; i = i + 1) {
                bus.addModule(modules[i]);
            }
            
            args = modules.concat(bus);
            args.push(bus);
            test.apply(this, args); // calls the test method with the signature of (module, module, bus)
        };
    }
};