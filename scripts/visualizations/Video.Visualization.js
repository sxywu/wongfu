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
    var sizeScale, timeScale;
    var rectPadding = 10, minSize = 10, maxSize = 100, borderRadius = 3;
    var color;
    var Video = function(selection) {
        container = selection;

        container.attr('transform', function(d) {
            return 'translate(' + padding.left + ',' + timeScale(d.publishedDate) + ')';
        })
        // .selectAll('.video')
        //     .data(videos).enter().append('image')
        //     .classed('video', true)
            .call(enter);

        return Video;
    }

    var enter = function(selection) {
        // selection.append('defs')
        //     .append('clipPath').attr('id', function(d) {
        //         return 'clipRect' + d.views;
        //     }).append('rect')
        //     .attr('y', function(d) {return -sizeScale(d.views) / 2})
        //     .attr('x', function(d) {return -sizeScale(d.views) / 8 * 3})
        //     .attr('width', function(d) {return sizeScale(d.views) / 4 * 3})
        //     .attr('height', function(d) {return sizeScale(d.views) / 4 * 3})
        //     .attr('rx', borderRadius)
        //     .attr('ry', borderRadius);
        selection.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 2 * rectPadding)
            .attr('y1', 0)
            .attr('stroke', function(d) {return app.d3Colors(d.youtuber)})
            .attr('stroke-dasharray', '1,1');

        var text = selection.filter(function(d) {return sizeScale(d.views) > 18});
        
        text.append('text')
            .attr('x', function(d) {return -rectPadding})
            .attr('y', 0)
            .attr('text-anchor', 'end')
            .attr('dy', '.35em')
            .attr('fill', function(d) {return app.d3Colors(d.youtuber)})
            .text(function(d) {return app.timeFormat(d.publishedDate)})

        selection.append('text')
            .attr('x', function(d) {return sizeScale(d.views) + 3 * rectPadding})
            .attr('text-anchor', 'start')
            .attr('dy', '.35em')
            .attr('fill', function(d) {return app.d3Colors(d.youtuber)})
            .text(function(d) {return d.title});

        selection.append('image')
            .attr('y', function(d) {return -sizeScale(d.views) / 8 * 3})
            .attr('x', function(d) {return 2 * rectPadding})
            .attr('width', function(d) {return sizeScale(d.views)})
            .attr('height', function(d) {return sizeScale(d.views) / 4 * 3})
            // .attr('clip-path', function(d) {return 'url(#clipRect' + d.views + ')'})
            // .attr('opacity', function(d) {return _.isEmpty(d.associations) ? 0 : 1})
            .attr('xlink:href', function(d) {return d.images[0]});

        selection.append('rect')
            .attr('y', function(d) {return -sizeScale(d.views) / 8 * 3})
            .attr('x', function(d) {return 2 * rectPadding})
            .attr('width', function(d) {return sizeScale(d.views)})
            .attr('height', function(d) {return sizeScale(d.views) / 4 * 3})
            .attr('stroke', function(d) {return app.d3Colors(d.youtuber)})
            .attr('fill', 'none')
            .attr('stroke-width', 1);
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

    Video.sizeScale = function(minViews, maxViews) {
        if (!arguments.length) return sizeScale;

        if (arguments.length > 1) {
            sizeScale = d3.scale.linear().domain([minViews, maxViews]).range([minSize, maxSize]);
        } else {
            sizeScale = minViews;
        }
        return Video;
    }

    Video.timeScale = function(minDate, maxDate) {
        if (!arguments.length) return timeScale;

        if (arguments.length > 1) {
            timeScale = d3.time.scale().domain([minDate, maxDate]).range([0, height]);
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