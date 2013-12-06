"use strict";

DEFINE('YD.HIP.MessageBus');

(function() {
    var textContainer,
        graphContainer;
        
    function clearChildren(element) {
        while (element.hasChildNodes()) {
            element.removeChild(element.lastChild);
        }
    }
    
    function clearBus() {
        clearChildren(textContainer);
        clearChildren(graphContainer);
    }
            
    function showMessageBusText(name, messageBus) {
        function showSubscriptions(defnList, module) {
            defnList.insert(new Element("dt").insert("Subscriptions:"));
            $H(module.subscribe).each(function(pair) {
                defnList.insert(new Element("dd").insert(pair[0]));
            });
        }
            
        function showPublications(defnList, module) {
            defnList.insert(new Element("dt").insert("Publications:"));
            $A(module.publish).each(function(topic) {
                defnList.insert(new Element("dd").insert(topic));
            });
        }
            
        function showModule(module) {
            var moduleName = module.name || "unknown",
                defnList = new Element("dl");
            
            textContainer.insert(new Element("h3").insert("Module " + moduleName)).insert(defnList);
            if(module.subscribe) {
                showSubscriptions(defnList, module);
            }
            if(module.publish) {
                showPublications(defnList, module);
            }
        }
        
        clearChildren(textContainer);
        textContainer.insert(new Element("h2").insert("Bus: " + name));
        messageBus.__modules().each(showModule);
    }
    
    function showMessageBusGraph(messageBus) {
        var graph = new Graph(),
            width = 1000,
            height = 1200,
            layouter = new Graph.Layout.Spring(graph),
            renderer = new Graph.Renderer.Raphael(graphContainer.id, graph, width, height),
            topicSubscribers = {};

        function addModuleNode(module) {
            graph.addNode(module.name);
        }
        
        function findSubscribers(module) {
            $H(module.subscribe).each(function(pair) {
                var topic = pair[0],
                    subscribers = topicSubscribers[topic] || [];
               
                subscribers.push(module.name);
                topicSubscribers[topic] = subscribers;
            });
        }
        
        function addModuleEdges(module) {
            $A(module.publish).each(function(topic) {
                var subscribers = topicSubscribers[topic] || [];
                subscribers.each(function(subscriber){
                    graph.addEdge(module.name, subscriber, {label: topic, directed: true});
                });
            });
        }
       
        function addStartNode() {
            graph.addNode("start");
            topicSubscribers.initialise.each(function(subscriber) {
                graph.addEdge("start", subscriber, {label: "initialise", directed: true});
            });
        }
        
        messageBus.__modules().each(addModuleNode);
        messageBus.__modules().each(findSubscribers);
        messageBus.__modules().each(addModuleEdges);
        addStartNode();
            
        layouter.layout();
        renderer.draw();
    }
    
    function forceUniqueNames(messageBus) {
        var names = {},
            nextCount = 1;
        
        messageBus.__modules().each(function(module) {
            var oldName = module.name || "unknown";
            
            if(oldName === "unknown" || !!names[oldName]) {
                module.name = oldName + " " + nextCount;
                nextCount += 1;
            }
            
            names[module.name] = true;
        });
    }

    YD.HIP.MessageBus.MessageBusVisualiser = function(textElement, graphElement) {
        textContainer = textElement;
        graphContainer = graphElement;
        
        return {
            showBus: function(name, messageBusInitialiser) {
                var messageBus;
                try {
                    clearBus();
                    messageBus = messageBusInitialiser();
                    if(!!messageBus) {
                        forceUniqueNames(messageBus);
                        showMessageBusText(name, messageBus);
                        showMessageBusGraph(messageBus);
                    }
                }
                catch(err) {
                    textContainer.insert(new Element("p").insert("Error: " + err.message));
                    textContainer.insert(new Element("pre").insert(err.stacktrace));
                }
            }
        };
    };
}());
