var topical = (function () {
    "use strict";

    var isArray = function (candidate) {
            return Object.prototype.toString.call(candidate) === "[object Array]";
        },
        toArray = function (theArguments) {
            return Array.prototype.slice.call(theArguments);
        },
        arrayOf = function (valueOrArray) {
            return isArray(valueOrArray) ? valueOrArray : [valueOrArray];
        },
        keysOf = function (map) {
            var keys = [],
                property;
            for (property in map) {
                if (Object.prototype.hasOwnProperty.call(map, property)) {
                    keys.push(property);
                }
            }
            return keys;
        },
        arrayEquals = function (left, right) {
            var i;

            if (left.length !== right.length) {
                return false;
            }

            for (i = 0; i < left.length; i = i + 1) {
                if (left[i] !== right[i]) {
                    return false;
                }
            }
            return true;
        },
        arraysAreIdentical = function (left, right) {
            var copyOfLeft = left.slice(),
                copyOfRight = right.slice();
            return arrayEquals(copyOfLeft.sort(), copyOfRight.sort());
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
                forEach(arrayOf(definition.publish), function (topic) {
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
        },
        /**
         * mapping is a dictionary of the form
         * { subscribeTo: <message or array of messages>, republishAs: <message or array of messages> }, e.g.
         * { subscribeTo: "source", republishAs: ["target1", "target2"] }
         */
        republish = function (mapping) {
            var subscriptions = {},
                publications = [],
                senders = arrayOf(mapping.subscribeTo),
                receivers = arrayOf(mapping.republishAs);

            forEach(senders, function (sender) {
                subscriptions[sender] = function (data) {
                    forEach(receivers, function (receiver) {
                        this.fire(receiver, data);
                    }.bind(this));
                };
            });

            forEach(receivers, function (receiver) {
                publications.push(receiver);
            });

            return messageBusModule({
                name: "Republish",
                subscribe: subscriptions,
                publish: publications
            });
        },
        /**
         * mapping is a dictionary of the form
         * { expecting: <message or array of messages>, publishing: <message or array of messages> }, e.g.
         * { expecting: [ "source1", "source2" ], publishing: ["target1", "target2"] }
         * the targets are published with a dictionary of the form { "source1" : data-for-source-1 }
         */
        coordinate = function (mapping) {
            var subscriptions = {},
                sources = arrayOf(mapping.expecting),
                publications = arrayOf(mapping.publishing);

            forEach(sources, function (source) {
                subscriptions[source] = function (data) {
                    var module = this;

                    module.received = module.received || {};
                    module.received[source] = data || {};

                    if (arraysAreIdentical(keysOf(module.received), sources)) {
                        forEach(publications, function (publication) {
                            module.fire(publication, module.received);
                        });
                        module.received = {};
                    }
                };
            });

            return messageBusModule({
                name: "Coordinate",
                subscribe: subscriptions,
                publish: publications
            });
        };

    return {
        MessageBus: messageBus,
        MessageBusModule: messageBusModule,
        Republish: republish,
        Coordinate: coordinate
    };
}());
