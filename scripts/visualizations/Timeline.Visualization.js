define([
    "jquery",
    "underscore",
    "d3"
], function(
    $,
    _,
    d3
) {
    var width = 800, height = 500, padding = {top: 250, left: 250, right: 25, bottom: 0};
    var youtuber, videos; // data
    var container, circle, text;
    var yScale, timeScale;
    var Timeline = function(selection) {
        container = selection;

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(timeScale);

        container.attr('transform', 'translate(' + padding.left + ',0)');
        // container.selectAll('.youtuber')
        //     .data(videos).enter().append('g')
        //     .classed('youtuber', true)
        //     .each(function(d, i) {
        //         var vis = TimelineVisualization()
        //             .videos(d.videos)
        //             .color(app.d3Colors(d.youtuber))
        //             .width(width).height(height)
        //             .yScale(yScale).timeScale(timeScale);
        //         d3.select(this).call(vis);
        //     });

        container.append("g")
            .classed('xAxis', true)
            // .attr("transform", "translate(0," + height + ")")
            .call(yAxis);

        circle = container.append('circle')
            .classed('marker', true)
            .attr('r', 5)
            .attr('cx', 0)
            .attr('cy', padding.top);

        text = container.append('text')
            .classed('markerDate', true)
            .attr('x', -10)
            .attr('y', padding.top)
            .attr('text-anchor', 'end')
            .attr('dy', '.35em');


        return Timeline;
    }

    Timeline.update = function() {
        var top = $(window).scrollTop() + padding.top,
            date = app.timeFormat(timeScale.invert(top));
        circle.attr('cy', top);

        text.attr('y', top)
            .text(date);
    }

    /*
    getter setters
    */

    Timeline.videos = function(value) {
        if (!arguments.length) return videos;

        videos = value;
        return Timeline;
    }

    // Timeline.yScale = function(minViews, maxViews) {
    //     if (!arguments.length) return yScale;

    //     yScale = d3.scale.linear().domain([minViews, maxViews]).range([0, height]);
    //     return Timeline;
    // }

    Timeline.timeScale = function(value) {
        if (!arguments.length) return timeScale;
        timeScale = value;
        // timeScale = d3.time.scale().domain([minDate, maxDate]).range([padding.top, height + padding.top]);
        return Timeline;
    }

    Timeline.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return Timeline;
    }

    Timeline.height = function(value) {
        if (!arguments.length) return height;
        height = value - (padding.top + padding.bottom);
        return Timeline;
    }

    Timeline.padding = function(value) {
        if (!arguments.length) return padding;
        padding = value;
        return Timeline;
    }

    return function() {
        return Timeline;
    }
});