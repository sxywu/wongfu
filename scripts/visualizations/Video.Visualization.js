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
        selection.attr('id', function(d) {return d.id = _.uniqueId('video')})
            .attr('cx', function(d) {return d.youtuberObj.x})
            .attr('cy', function(d) {return d.y})
            .attr('r', 6)
            .attr('fill', function(d) {return app.d3Colors(d.youtuber)})
            .attr('stroke', '#fff')
            .on('mouseover', mouseover)
            .on('mouseleave', mouseleave)
            .on('click', Video.click);

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

    Video.click = function(d, type) {
        var video;
        if (type === 'timeline') {
            d = d.datum();
            video = this;
        } else {
            video = d3.select(this);
        }

        if (!app.clicked) {
            // if nothing is clicked, fade everything
            d3.selectAll('.video, .videoLine, .node, .link').classed('fade', true)
                .classed('solid', false);
        } else {
            // if something has already been clicked, hide the shown names
            d3.selectAll('.node.solid').call(graphVisualization.hideName);
            // all the previously highlighted videos and youtubers should also be faded.
            d3.selectAll('.solid').classed('fade', true)
                .classed('solid', false);
        }

        if (type !== 'timeline' && app.clicked === d) {
            app.clicked = false;
            d.youtuberObj.clicked = false;
            d3.selectAll('.fade').classed('fade', false)
                .classed('solid', false);
        } else {
            var template = _.template(VideoTemplate, {video: d});
            $('.description').html(template);

            // the clicked video and associated youtubers shouldn't be faded
            video.classed('fade', false)
                .classed('solid', true);
            d3.selectAll('#' + d.youtuber).classed('fade', false)
                .classed('solid', true);

            _.each(d.associations, function(youtuber) {
                    d3.selectAll('#' + youtuber).classed('fade', false)
                        .classed('solid', true);
                    d3.selectAll('#' + d.youtuber + youtuber).classed('fade', false)
                        .classed('solid', true);
                })

            d3.selectAll('.node.solid').call(graphVisualization.showName);

            app.clicked = d;
            d.youtuberObj.clicked = true;
        }
        
        
    }

    Video.unclick = function(d) {
        app.clicked = false;
        d.youtuberObj.clicked = false;

        $('.description').html();
        d3.selectAll('.video, .videoLine, .node, .link').classed('fade', false)
                .classed('solid', false);
    }

    return function() {
        return Video;
    }
});