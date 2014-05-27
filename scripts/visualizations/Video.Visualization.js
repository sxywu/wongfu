define([
    "jquery",
    "underscore",
    "d3",
    'app/visualizations/Graph.Visualization',
    "text!app/templates/Video.Template.html"
], function(
    $,
    _,
    d3,
    GraphVisualization,
    VideoTemplate
) {
    var width = 800, height, padding = {top: 0, left: 0, right: 0, bottom: 50};
    var youtubers, videos; // data
    var container;
    var sizeScale, timeScale;
    var rectPadding = 30, minSize = 10, maxSize = 100, borderRadius = 3;
    var color;
    var graphVisualization = GraphVisualization();
    var Video = function(selection) {
        container = selection;

        container
            .call(enter);

        return Video;
    }

    var enter = function(selection) {
        selection.attr('cx', function(d) {return d.youtuberObj.x})
            .attr('cy', function(d) {return d.y})
            .attr('r', 5)
            .attr('fill', function(d) {return app.d3Colors(d.youtuber)})
            .attr('stroke', '#fff')
            .on('mouseover', mouseover)
            .on('mouseleave', mouseleave)
            .on('click', click);

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

    var click = function(d) {
        var template = _.template(VideoTemplate, {video: d});
        $('.description').html(template);

        d3.selectAll('.video, .videoLine, .node, .link').classed('fade', true)
            .classed('solid', false);
        d3.select(this).classed('fade', false);
        d3.selectAll('#' + d.youtuber).classed('fade', false)
            .classed('solid', true);

        _.each(d.associations, function(youtuber) {
                d3.selectAll('#' + youtuber).classed('fade', false)
                    .classed('solid', true);
                d3.selectAll('#' + d.youtuber + youtuber).classed('fade', false)
                    .classed('solid', true);
            })

        d3.selectAll('.node.solid').call(graphVisualization.showName);
        
    }

    return function() {
        return Video;
    }
});