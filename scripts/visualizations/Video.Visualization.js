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
    var youtuber, videos; // data
    var container;
    var yScale, timeScale;
    var barPadding = 1, barWidth = 5;
    var color;
    var Video = function(selection) {
        container = selection;

        container.selectAll('.bar')
            .data(videos).enter().append('rect')
            .classed('bar', true)
            .call(enter);

        return Video;
    }

    var enter = function(selection) {
        selection.attr('x', function(d, i) {return timeScale(new Date(d.published))})
            .attr('y', function(d) {return height - yScale(parseInt(d.views))})
            .attr('width', barWidth)
            .attr('height', function(d) {return yScale(parseInt(d.views))})
            .attr('fill', color)
            .attr('fill-opacity', .5);

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

    /*
    getter setters
    */
    Video.youtuber = function(value) {
        if (!arguments.length) return youtuber;

        youtuber = value;
        return Video;
    }

    Video.videos = function(value) {
        if (!arguments.length) return videos;

        videos = value;
        return Video;
    }

    Video.color = function(value) {
        if (!arguments.length) return color;

        color = value;
        return Video;
    }

    Video.yScale = function(minViews, maxViews) {
        if (!arguments.length) return yScale;

        if (arguments.length > 1) {
            yScale = d3.scale.linear().domain([minViews, maxViews]).range([0, height]);
        } else {
            yScale = minViews;
        }
        return Video;
    }

    Video.timeScale = function(minDate, maxDate) {
        if (!arguments.length) return timeScale;

        if (arguments.length > 1) {
            timeScale = d3.time.scale().domain([minDate, maxDate]).range([0, width]);
        } else {
            timeScale = minDate;
        }
        return Video;
    }

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