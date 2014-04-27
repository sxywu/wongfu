define([
    "jquery",
    "underscore",
    "d3",
    "app/visualizations/Video.Visualization"
], function(
    $,
    _,
    d3,
    VideoVisualization
) {
    var width = 800, height = 500, padding = {top: 200, left: 150, right: 25, bottom: 800};
    var youtuber, videos; // data
    var container;
    var yScale, timeScale;
    var Video = function(selection) {
        container = selection;

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(timeScale);

        container.attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');
        // container.selectAll('.youtuber')
        //     .data(videos).enter().append('g')
        //     .classed('youtuber', true)
        //     .each(function(d, i) {
        //         var vis = VideoVisualization()
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

        return Video;
    }

    /*
    getter setters
    */

    Video.videos = function(value) {
        if (!arguments.length) return videos;

        videos = value;
        return Video;
    }

    Video.yScale = function(minViews, maxViews) {
        if (!arguments.length) return yScale;

        yScale = d3.scale.linear().domain([minViews, maxViews]).range([0, height]);
        return Video;
    }

    Video.timeScale = function(minDate, maxDate) {
        if (!arguments.length) return timeScale;

        timeScale = d3.time.scale().domain([minDate, maxDate]).range([0, height]);
        return Video;
    }

    Video.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return Video;
    }

    Video.height = function(value) {
        if (!arguments.length) return height;
        height = value - (padding.top + padding.bottom);
        return Video;
    }

    return function() {
        return Video;
    }
});