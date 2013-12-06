/*
 * @include "/HIP/web/js/YD/HIP/MessageBus/MessageBus.js"
 */

"use strict";

DEFINE('YD.HIP.MessageBus');

YD.HIP.MessageBus.MessageBusTestUtils = {
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

        return YD.HIP.MessageBus.MessageBusModule(self);
    },

    busHolding: function(modules, test) {
        return function() {
            var bus = YD.HIP.MessageBus.MessageBus(),
                args;

            modules.each(function(mod) { bus.addModule(mod); });
            
            args = modules.concat(bus);
            args.push(bus);
            test.apply(this, args); // calls the test method with the signature of (module, module, bus)
        };
    }
};