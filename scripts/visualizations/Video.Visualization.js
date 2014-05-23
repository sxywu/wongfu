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
            // .attr('transform', function(d) {
            //     return 'translate(' + d.x + ',' + d.y + ')';
            // })
            .call(enter);

        return Video;
    }

    var enter = function(selection) {
        var diagonal = d3.svg.diagonal(),
            gap = 75;
        selection.append('path')
            .attr('d', function(d) {
                var path = "",
                    source;
                _.each(d.videos, function(target, i) {
                    if (source) {
                        if (source.y > target.y - gap) {
                            path += diagonal({
                                source: {x: source.youtuberObj.x, y: source.y},
                                target: {x: target.youtuberObj.x, y: target.y}
                            });
                        } else {
                            path += diagonal({
                                source: {x: source.youtuberObj.x, y: source.y},
                                target: {x: d.youtuber.x, y: source.y + gap / 3}
                            })
                            path += 'L' + d.youtuber.x + ',' + (target.y - gap / 3);
                            path += diagonal({
                                source: {x: d.youtuber.x, y: target.y - gap / 3},
                                target: {x: target.youtuberObj.x, y: target.y}
                            })
                        }
                        
                    } else if (d.youtuber.x === target.x) {
                        path += 'L' + d.youtuber.x + ',' + target.y;
                    } else {
                        path += 'L' + d.youtuber.x + ',' + (target.y - gap / 3);
                        path += diagonal({
                                source: {x: d.youtuber.x, y: target.y - gap / 3},
                                target: {x: target.youtuberObj.x, y: target.y}
                            })
                    }
                    source = target;
                });
                return 'M' + d.youtuber.x + ',' + d.youtuber.y + ' ' + path.replace(/M[0-9\,.]*/gi, '');
            }).attr('fill', 'none')
            .attr('stroke', function(d) {return app.d3Colors(d.youtuber.youtuber)})
            .attr('stroke-width', 4);
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
    Video.youtubers = function(value) {
        if (!arguments.length) return youtubers;

        youtubers = value;
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