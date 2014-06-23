define([
    "jquery",
    "underscore",
    "d3",
    "app/visualizations/Graph.Visualization"
], function(
    $,
    _,
    d3,
    GraphVisualization
) {
    var width = 800, height, padding = {top: 0, left: 0, right: 0, bottom: 50};
    var youtubers, videos; // data
    var container;
    var timeScale;
    var lineWidth = 2;
    var color;
    var graphVisualization = GraphVisualization();
    var Line = function(selection) {
        container = selection;

        container
            .attr('id', function(d) {return d.youtuber.youtuber})
            .call(enter);

        return Line;
    }

    var enter = function(selection) {
        var diagonal = d3.svg.diagonal(),
            gap = 75;
        selection.attr('d', function(d) {
                var path = "",
                    source;

                _.each(d.videos, function(target, i) {
                    if (source) {
                        var sourceX = source.youtuberObj.x,
                            targetX = target.youtuberObj.x,
                            index;

                        if (source.y > target.y - gap) {
                            path += diagonal({
                                source: {x: sourceX, y: source.y},
                                target: {x: targetX, y: target.y}
                            });
                        } else {
                            path += diagonal({
                                source: {x: sourceX, y: source.y},
                                target: {x: d.youtuber.x, y: source.y + gap / 3}
                            })
                            path += 'L' + d.youtuber.x + ',' + (target.y - gap / 3);
                            path += diagonal({
                                source: {x: d.youtuber.x, y: target.y - gap / 3},
                                target: {x: targetX, y: target.y}
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
                return 'M' + d.youtuber.x + ',' + app.padding.top + ' ' + path.replace(/M[0-9\,.]*/gi, '');
            }).attr('fill', 'none')
            .attr('stroke', function(d) {return app.d3Colors(d.youtuber.youtuber)})
            .attr('stroke-width', lineWidth)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('opacity', .75);
    }

    var exit = function(selection) {
     
    }

    /**
    events
    */

    /*
    getter setters
    */
    Line.youtubers = function(value) {
        if (!arguments.length) return youtubers;

        youtubers = value;
        return Line;
    }

    Line.videos = function(value) {
        if (!arguments.length) return videos;

        videos = value;
        return Line;
    }

    Line.color = function(value) {
        if (!arguments.length) return color;

        color = value;
        return Line;
    }

    Line.timeScale = function(minDate, maxDate) {
        if (!arguments.length) return timeScale;

        if (arguments.length > 1) {
            timeScale = d3.time.scale().domain([minDate, maxDate]).range([0, height]);
        } else {
            timeScale = minDate;
        }
        return Line;
    }

    Line.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return Line;
    }

    Line.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return Line;
    }

    return function() {
        return Line;
    }
});