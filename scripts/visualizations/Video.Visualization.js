define([
    "jquery",
    "underscore",
    "d3"
], function(
    $,
    _,
    d3
) {
    var width = 800, height, padding = {top: 0, left: 0, right: 0, bottom: 50};
    var youtubers, videos; // data
    var container;
    var sizeScale, timeScale;
    var rectPadding = 30, minSize = 10, maxSize = 100, borderRadius = 3;
    var color;
    var Video = function(selection) {
        container = selection;

        container
            .call(enter);

        return Video;
    }

    var enter = function(selection) {
        selection.attr('cx', function(d) {return d.youtuberObj.x})
            .attr('cy', function(d) {return d.y})
            .attr('r', 5)
            .attr('fill', function(d) {return app.d3Colors(d.youtuber)})
            .attr('stroke', '#fff')
            .on('mouseover', mouseover)
            .on('mouseleave', mouseleave);

    }

    var exit = function(selection) {
     
    }

    /**
    events
    */
    var mouseover = function() {
    }

    var mouseleave = function() {
    }

    return function() {
        return Video;
    }
});