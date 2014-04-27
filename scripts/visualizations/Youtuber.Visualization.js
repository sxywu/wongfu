define([
    "jquery",
    "underscore",
    "d3"
], function(
    $,
    _,
    d3
) {
    var width = 800, height, padding = {top: 0, left: 250, right: 0, bottom: 50};
    var youtuber, videos; // data
    var container;
    var radiusScale, timeScale;
    var circlePadding = 10, minRadius = 30, maxRadius = 80;
    var color;
    var Youtuber = function(selection) {
        container = selection;
        color = app.colors.blue;

        container.attr('transform', function(d) {
            return 'translate(' + padding.left + ',' + timeScale(d.joinedDate) + ')';
        })
        // .selectAll('.video')
        //     .data(videos).enter().append('image')
        //     .classed('video', true)
            .call(enter);

        return Youtuber;
    }

    var enter = function(selection) {
        selection.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 3 * circlePadding)
            .attr('y1', 0)
            .attr('stroke', color)
            .attr('stroke-width', 2);

        var text = selection.filter(function(d) {return radiusScale(d.statistics.subscriberCount) > 18});
        
        text.append('text')
            .attr('x', function(d) {return -circlePadding})
            .attr('y', 0)
            .attr('text-anchor', 'end')
            .attr('dy', '.35em')
            .attr('fill', color)
            .text(function(d) {return app.timeFormat(d.joinedDate)})

        text.append('text')
            .attr('x', function(d) {return radiusScale(d.statistics.subscriberCount) + 4 * circlePadding})
            .attr('text-anchor', 'start')
            .attr('dy', '.35em')
            .attr('fill', color)
            .text(function(d) {return d.author})

        selection.append('circle')
            .attr('cx', function(d) {return 3 * circlePadding + radiusScale(d.statistics.subscriberCount) / 2})
            .attr('r', function(d) {return radiusScale(d.statistics.subscriberCount) / 2 + 3})
            .attr('fill', 'white')
            .attr('stroke', color)
            .attr('stroke-width', 3);

        selection.append('defs')
            .append('clipPath').attr('id', function(d) {
                return 'clipTimelineCircle' + d.index;
            }).append('circle')
            .attr('cx', function(d) {return 3 * circlePadding + radiusScale(d.statistics.subscriberCount) / 2})
            .attr('r', function(d) {return radiusScale(d.statistics.subscriberCount) / 2});
        selection.append('image')
            .attr('y', function(d) {return -radiusScale(d.statistics.subscriberCount) / 2})
            .attr('x', function(d) {return 3 * circlePadding})
            .attr('width', function(d) {return radiusScale(d.statistics.subscriberCount)})
            .attr('height', function(d) {return radiusScale(d.statistics.subscriberCount)})
            .attr('clip-path', function(d) {return 'url(#clipTimelineCircle' + d.index + ')'})
            // .attr('opacity', function(d) {return _.isEmpty(d.associations) ? 0 : 1})
            .attr('xlink:href', function(d) {return d.image});

        

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
    Youtuber.radiusScale = function(minSubscribers, maxSubscribers) {
        if (!arguments.length) return radiusScale;

        if (arguments.length > 1) {
            radiusScale = d3.scale.linear().domain([minSubscribers, maxSubscribers]).range([minRadius, maxRadius]);
        } else {
            radiusScale = minViews;
        }
        return Youtuber;
    }

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