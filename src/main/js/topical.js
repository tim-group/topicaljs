var topical = (function () {
    "use strict";

    var toArray = function (theArguments) {
            return Array.prototype.slice.call(theArguments);
        },
        forEach = function (array, fn, context) {
            var i = 0;
            for (i = 0; i < array.length; i = i + 1) {
                fn.call(context || this, array[i]);
            }
        },
        messageBus = function () {
            var modules = [],
                MODULE_ADDED_MESSAGE = "moduleAdded",
                catcher = function () { return; },
                bus = {
                    addModules: function (modulesToAdd) {
                        var theBus = this;
                        forEach(modulesToAdd, function (module) {
                            theBus.addModule(module);
                        });
                    },

                    addModule: function (module) {
                        modules.push(module);
                        module.__bus__ = this;
                        this.fire(MODULE_ADDED_MESSAGE, module);
                    },

                    setCatcher: function (newCatcher) {
                        catcher = newCatcher;
                    },

                    fire: function () {
                        var parameters = toArray(arguments),
                            name = parameters[0];
                        parameters.shift();
                        this._fire(name, parameters);
                    },

                    _fire: function (name, dataArray) {
                        var wasSubscribed = false;
                        forEach(modules, function (module) {
                            if (module.subscribe && module.subscribe[name]) {
                                wasSubscribed = true;
                                module.subscribe[name].apply(module, dataArray);
                            }
                        });
                        if (!wasSubscribed && name !== MODULE_ADDED_MESSAGE) {
                            catcher.apply(this, [name].concat(dataArray));
                        }
                    },

                    __modules: function () {
                        return modules;
                    }
                };

            forEach(toArray(arguments), function (module) {
                bus.addModule(module);
            });

            bus.fire("initialise");
            return bus;
        },
        messageBusModule = function (definition) {
            if (definition.publish) {
                forEach(definition.publish, function (topic) {
                    var topicName = topic.substr(0, 1).toUpperCase() + topic.substr(1);
                    definition['fire' + topicName] = function () {
                        definition.__bus__._fire(topic, toArray(arguments));
                    };
                });
            }
            if (definition.initialise) {
                definition.initialise();
            }

            definition.fire = function () { definition.__bus__.fire.apply(definition.__bus__, toArray(arguments)); };

            return definition;
        };

    return {
        MessageBus: messageBus,
        MessageBusModule: messageBusModule
    };
}());
