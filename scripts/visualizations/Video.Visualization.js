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
    var rectPadding = 30, minSize = 10, maxSize = 100, radius = 5;
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
            .attr('x', function(d) {return d.youtuberObj.x - radius})
            .attr('y', function(d) {return d.y - radius})
            .attr('width', radius * 2)
            .attr('height', radius * 2)
            .attr('stroke-width', 2)
            .attr('rx', 2)
            .attr('ry', 2)
            .call(solidVideo)
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
            d3.selectAll('.videoLine').classed('fade', true)
                .classed('solid', false);
            d3.selectAll('.video')
                .call(fadedVideo);
        } else {
            // all the previously highlighted video lines should be faded
            // and their stroke should go back to solid
            d3.selectAll('.videoLine.solid').classed('fade', true)
                .classed('solid', false)
                .call(solidLine);
            d3.selectAll('.video.solid').classed('solid', false)
                .call(fadedVideo);
        }

        if (type !== 'timeline' && app.clicked === d) {
            Video.unclick(d);
        } else {
            // get a event system...
            $(this).trigger('summarize', d);

            // the clicked video and its publisher shouldn't be faded
            video.classed('solid', true)
                .call(filledVideo);
            d3.selectAll('.videoLine#' + d.youtuber).classed('fade', false)
                .classed('solid', true);

            _.each(d.associations, function(youtuber) {
                    // associated youtubers should get dashed lines
                    d3.selectAll('.videoLine#' + youtuber).classed('fade', false)
                        .classed('solid', true)
                        .call(dashedLine);
                })

            app.clicked = d;
            d.youtuberObj.clicked = true;
        }
        
        
    }

    Video.unclick = function(d) {
        app.clicked = false;
        d.youtuberObj.clicked = false;

        $('.description').html();
        d3.selectAll('.videoLine').classed('fade', false)
            .classed('solid', false)
            .call(solidLine);
        d3.selectAll('.video')
            .classed('solid', false)
            .call(solidVideo);
    }

    // helper for clicking and unclicking video
    solidLine = function(selection) {
        selection.attr('stroke-dasharray', 'none');
    }

    dashedLine = function(selection) {
        selection.attr('stroke-dasharray', '5, 5');
    }

    filledVideo = function(selection) {
        selection.attr('fill', function(d) {return app.d3Colors(d.youtuber)})
            .attr('stroke', function(d) {return app.d3Colors(d.youtuber)})
            .attr('stroke-opacity', 1);
    }

    solidVideo = function(selection) {
        selection
            .attr('fill', "#fff")
            .attr('stroke', function(d) {return app.d3Colors(d.youtuber)})
            .attr('stroke-opacity', 1);
    }

    fadedVideo = function(selection) {
        selection.attr('fill', '#fff')
            .attr('stroke', function(d) {return app.d3Colors(d.youtuber)})
            .attr('stroke-opacity', .05);
    }

    return function() {
        return Video;
    }
});