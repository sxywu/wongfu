define([
    "jquery",
    "underscore",
    "d3"
], function(
    $,
    _,
    d3
) {

    var Video = function(selection) {
        

    }

    var enterNodes = function(selection) {
        

    }

    var enterLinks = function(selection) {
     
    }

    /**
    events
    */
    var mouseover = function() {

    }

    var mouseleave = function() {

    }

    /*
    getter setters
    */

    Video.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return Video;
    }

    Video.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return Video;
    }

    return function() {
        return Video;
    }
});