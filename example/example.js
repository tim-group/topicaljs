"use strict";

(window.example = function(edit) {
    function setDisabled(element, value) {
        $(element).prop("disabled", value);
        return $(element);
    }
    
    function disable(element) {
        return setDisabled(element, true);
    }
    
    function enable(element) {
        return setDisabled(element, false);
    }
    
    return {
        init: function() {
            return topical.MessageBus(
                topical.Coordinate({ expecting: ["leftTextEntered", "rightTextEntered"], publishing: "bothTextsEntered" }),

                topical.Republish({ subscribeTo: "init", republishAs: [ "hello", "clear"] }),
                topical.Republish({ subscribeTo: "reset", republishAs: "clear" }),

                topical.MessageBusModule({
                    name: "Hello",
                    subscribe: {
                        hello: function() {
                            alert("This alert is shown when the hello event is fired");
                        }
                    }
                }),

                topical.MessageBusModule({
                    name: "Left",
                    subscribe: {
                        init: function() {
                            $("#left-text").change(function() { this.fireLeftTextEntered($("#left-text").val()); }.bind(this));
                        },
                        leftTextEntered: function() { disable($("#left-text")); },
                        clear: function() { enable($("#left-text")).val(""); }
                    },
                    publish: "leftTextEntered"
                }),
                
                topical.MessageBusModule({
                    name: "Right",
                    subscribe: {
                        init: function() { $("#right-text").change(function() { this.fireRightTextEntered($("#right-text").val()); }.bind(this)); },
                        rightTextEntered: function() { disable($("#right-text")); },
                        clear: function() { enable($("#right-text")).val(""); }
                    },
                    publish: "rightTextEntered"
                }),

                topical.MessageBusModule({
                    name: "Both",
                    subscribe: {
                        bothTextsEntered: function(data) { 
                            $("#both-right").text(data.rightTextEntered);
                            $("#both-left").text(data.leftTextEntered);
                        },
                        clear: function() {
                            $("#both-right").text("");
                            $("#both-left").text("");
                        }
                    }
                }),
                
                topical.MessageBusModule({
                    name: "Reset",
                    subscribe: {
                        init: function() { 
                            $("#reset").click(function() { 
                                this.fireReset(); }.bind(this));
                        }
                    },
                    publish: "reset"
                })
            );
        }
    };
}());
