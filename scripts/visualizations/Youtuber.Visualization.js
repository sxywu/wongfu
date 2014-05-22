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
    var radiusScale, timeScale;
    var circlePadding = 30, minRadius = 30, maxRadius = 80;
    var color;
    var Youtuber = function(selection) {
        container = selection;
        color = function(youtuber) {
            return _.contains(app.youtubersWithVideo, youtuber) ? app.d3Colors(youtuber) : '#999';
        };

        container
            .attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            })
        // .selectAll('.video')
        //     .data(videos).enter().append('image')
        //     .classed('video', true)
            .call(enter);

        return Youtuber;
    }

    var enter = function(selection) {
        var diagonal = d3.svg.diagonal()
            .source(function(d) {return {x: 0, y: 0}})
            .target(function(d) {return {x: 4 * circlePadding, y: d.imageY}});

        selection.append('path')
            .attr('d', diagonal)
            // .attr('x1', 0)
            // .attr('y1', 0)
            // .attr('x2', 3 * circlePadding)
            // .attr('y1', 0)
            .attr('fill', 'none')
            .attr('stroke', function(d) {return color(d.youtuber)})
            .attr('stroke-width', 2);

        var text = selection.filter(function(d) {return app.youtuberSize > 18});
        
        text.append('text')
            .attr('x', function(d) {return -circlePadding})
            .attr('y', 0)
            .attr('text-anchor', 'end')
            .attr('dy', '.35em')
            .attr('fill', function(d) {return color(d.youtuber)})
            .text(function(d) {return app.timeFormat(d.joinedDate)})

        text.append('text')
            .attr('x', function(d) {return app.youtuberSize + 5 * circlePadding})
            .attr('y', function(d) {return d.imageY})
            .attr('text-anchor', 'start')
            .attr('dy', '.35em')
            .attr('fill', function(d) {return color(d.youtuber)})
            .text(function(d) {return d.author + ' (' + d.youtuber + ')'})

        selection.append('line')
            .attr('x1', app.youtuberSize + 5 * circlePadding)
            .attr('y1', function(d) {return d.imageY + 10})
            .attr('x2', function(d) {return radiusScale(d.subscribers) + app.youtuberSize + 4 * circlePadding})
            .attr('y2', function(d) {return d.imageY + 10})
            .attr('stroke', function(d) {return color(d.youtuber)})
            .attr('stroke-width', 3);

        selection.append('circle')
            .attr('cx', function(d) {return 4 * circlePadding + app.youtuberSize / 2})
            .attr('cy', function(d) {return d.imageY})
            .attr('r', function(d) {return app.youtuberSize / 2 + 3})
            .attr('fill', 'white')
            .attr('stroke', function(d) {return color(d.youtuber)})
            .attr('stroke-width', 3);

        

        selection.append('defs')
            .append('clipPath').attr('id', function(d) {
                return 'clipTimelineCircle' + d.index;
            }).append('circle')
            .attr('cx', function(d) {return 4 * circlePadding + app.youtuberSize / 2})
            .attr('cy', function(d) {return d.imageY})
            .attr('r', function(d) {return app.youtuberSize / 2});
        selection.append('image')
            .attr('y', function(d) {return d.imageY - app.youtuberSize / 2})
            .attr('x', function(d) {return 4 * circlePadding})
            .attr('width', function(d) {return app.youtuberSize})
            .attr('height', function(d) {return app.youtuberSize})
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
            radiusScale = minSubscribers;
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