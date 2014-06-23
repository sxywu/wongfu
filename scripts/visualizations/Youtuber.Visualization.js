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
    var timeScale;
    var radius = 5;
    var color;
    var Youtuber = function(selection) {
        container = selection;
        color = function(youtuber) {
            return _.contains(app.youtubersWithVideo, youtuber) ? app.d3Colors(youtuber) : '#999';
        };

        container
            .attr('id', function(d) {return d.youtuber.youtuber})
            .attr('transform', function(d) {
                return 'translate(' + d.x + ',' + app.padding.top + ')';
            })
            .call(enter);

        return Youtuber;
    }

    var enter = function(selection) {

        selection
            .attr('r', radius)
            .attr('fill', 'white')
            .attr('stroke', function(d) {return color(d.youtuber)})
            .attr('stroke-width', 2);

    }

    var exit = function(selection) {
     
    }

    /**
    events
    */

    /*
    getter setters
    */

    Youtuber.timeScale = function(minDate, maxDate) {
        if (!arguments.length) return timeScale;

        if (arguments.length > 1) {
            timeScale = d3.time.scale().domain([minDate, maxDate]).range([0, height]);
        } else {
            timeScale = minDate;
        }
        return Youtuber;
    }

    Youtuber.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return Youtuber;
    }

    Youtuber.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return Youtuber;
    }

    return function() {
        return Youtuber;
    }
});