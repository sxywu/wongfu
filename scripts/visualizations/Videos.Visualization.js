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
    var width = 800, height, padding = {top: 0, left: 25, right: 25, bottom: 25};
    var youtuber, videos; // data
    var container;
    var yScale, timeScale;
    var Video = function(selection) {
        container = selection;
        width = $(container.node()).parent().width() - padding.left - padding.right;
        height = $(container.node()).parent().height() - padding.top - padding.bottom;
        var min = _.chain(videos).pluck('video').flatten().pluck('views').min(function(d) {return parseInt(d)}).value(),
            max = _.chain(videos).pluck('video').flatten().pluck('views').max(function(d) {return parseInt(d)}).value(),
            minDate = _.chain(videos).pluck('video').flatten().sortBy(function(d) {return d.published}).first().value().published,
            maxDate = _.chain(videos).pluck('video').flatten().sortBy(function(d) {return d.published}).last().value().published;

        yScale = d3.scale.linear().domain([parseInt(min), parseInt(max)]).range([0, height]);
        timeScale = d3.time.scale().domain([new Date(minDate), new Date(maxDate)]).range([0, width]);
        var xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(timeScale);

        container.attr('transform', 'translate(' + padding.left + ',0)');
        container.selectAll('.youtuber')
            .data(videos).enter().append('g')
            .classed('youtuber', true)
            .each(function(d, i) {
                var vis = VideoVisualization()
                    .color(app.d3Colors(d.youtuber))
                    .width(width).height(height)
                    .yScale(yScale).timeScale(timeScale);
                d3.select(this).call(vis);
            });

        container.append("g")
            .classed('xAxis', true)
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
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

    Video.videos = function(value) {
        if (!arguments.length) return videos;

        videos = value;
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