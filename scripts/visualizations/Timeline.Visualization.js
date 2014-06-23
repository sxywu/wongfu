define([
    "jquery",
    "underscore",
    "d3"
], function(
    $,
    _,
    d3
) {
    var width = 800, height = 500, padding = {top: 600, left: 500, right: 25, bottom: 0};
    var youtuber, videos; // data
    var container, marker, circle, text;
    var yScale, timeScale;
    var Timeline = function(selection) {
        container = selection;

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(timeScale);

        container.attr('transform', 'translate(' + app.padding.left + ',0)');
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

        // container.append("g")
        //     .classed('xAxis', true)
        //     // .attr("transform", "translate(0," + height + ")")
        //     .call(yAxis);

        // marker = container.append('g')
        //     .classed('marker', true)
        //     .attr('transform', 'translate(0,' + app.padding.top + ')');

        // marker.append('line')
        //     .attr('x1', -app.nodePadding.right * 4)
        //     .attr('y1', 0)
        //     .attr('x2', width)
        //     .attr('y1', 0)
        //     .attr('stroke', '#000')
        //     .attr('fill', 'none');

        // circle = marker.append('circle')
        //     .classed('markerCircle', true)
        //     .attr('r', 5)
        //     .attr('cx', -app.nodePadding.right * 4)
        //     .attr('cy', 0);

        // text = marker.append('text')
        //     .classed('markerDate', true)
        //     .attr('x', -app.nodePadding.right * 6)
        //     .attr('y', 0)
        //     .attr('text-anchor', 'end')
        //     .attr('dy', '.35em');


        return Timeline;
    }

    Timeline.update = function() {
        // var top = $(window).scrollTop() + app.padding.top,
        //     date = app.timeFormat(timeScale.invert(top));
        // marker.attr('transform', 'translate(0,' + top + ')');

        // text.text(date);
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
        height = value - (app.padding.top + app.padding.bottom);
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