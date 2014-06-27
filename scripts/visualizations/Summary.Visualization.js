define([
    "jquery",
    "underscore",
    "d3"
], function(
    $,
    _,
    d3
) {
    var container, video, youtubers, top, left;
    var videoPadding = {top: 0, left: 15, right: 0, bottom: 8};
    var videoWidth = 80, cornerRadius = 3, dateSize = 14, titleSize = 18;
    var youtuberPadding = {top: 10, left: 15, right: 0, bottom: 0};
    var youtuberHeight = 100, youtuberSize = 30, barWidth = 3;
    var fontColor = "#073642";
    var arrowObj, diagonal = d3.svg.diagonal()
    var timeScale = d3.time.scale().range([0, 400]), viewScale = d3.scale.linear().range([0, youtuberSize * 2]);

    var Summary = function(selection) {
        container = selection;

        container
            .call(enterArrow)
            .call(enterVideo);

        app.mediator.subscribe('video:summarize', update);

        return Summary;
    }

    var enterArrow = function(selection) {
        arrow = d3.select('svg').insert('path', '.timeline')
            .attr('fill', 'none')
            .attr('stroke', fontColor)
            .attr('stroke-width', 2);
    }

    var updateArrow = function(data) {
        if (data) {
            arrowObj = {
                source: {x: app.padding.left + data.youtuberObj.x, y: data.y},
                target: {x: left, y: top + (videoWidth / 8 * 3)}
            }

            arrow.datum(arrowObj)
                .attr('d', diagonal);
        } else if (arrowObj) {
            arrowObj.target = {x: left, y: top + (videoWidth / 8 * 3)}

            arrow.datum(arrowObj)
                .attr('d', diagonal);
        }

    }

    var enterVideo = function(selection) {
        video = selection.append('g')
            .classed('summaryVideo', true);
        video.append('image')
            .attr('width', videoWidth)
            .attr('height', videoWidth / 4 * 3);
        video.append('rect')
            .classed('imageBorder', true)
            .attr('width', videoWidth)
            .attr('height', videoWidth / 4 * 3)
            .attr('rx', cornerRadius)
            .attr('ry', cornerRadius)
            .attr('fill', 'none')
            .attr('stroke-width', cornerRadius);

        video.append('text')
            .classed('publishDate', true)
            .attr('x', videoWidth + videoPadding.left)
            .attr('y', videoWidth / 4 * 3 - titleSize - videoPadding.bottom * 2)
            .attr('font-size', dateSize)
            .attr('fill', fontColor);

        video.append('text')
            .classed('videoTitle', true)
            .attr('x', videoWidth + videoPadding.left)
            .attr('y', videoWidth / 4 * 3 - videoPadding.bottom)
            .attr('font-size', titleSize)
            .attr('fill', fontColor);
    }

    var updateVideo  = function(data) {
        video.select('image')
            .attr('xlink:href', data.images[0]);
        video.select('.imageBorder')
            .attr('stroke', fontColor);
        video.select('.publishDate')
            .text(app.timeFormat(data.publishedDate) + ' | ' + data.views + ' views');
        video.select('.videoTitle')
            .text(data.title);
    }

    var enterYoutuber = function(selection) {
        selection = selection.enter().append('g')
            .classed('youtuber', true)
            .attr('transform', function(d, i) {
                return 'translate(0,' + ((i + 1) * youtuberPadding.top 
                    + (i * youtuberHeight)
                    + (videoWidth / 4 * 3)) + ')';
            });

        selection.append('image')
            .attr('x', videoWidth)
            .attr('y', youtuberSize)
            .attr('width', youtuberSize * 2)
            .attr('height', youtuberSize * 2);

        selection.append('g')
            .selectAll('bar')
            .data(function(d) {return d.videos})
            .call(enterTimeline);

        updateYoutuber(selection);
    }

    var updateYoutuber = function(selection) {
        selection.select('image')
            .attr('xlink:href', function(d) {
                return d.youtuber.image;
            })
    }

    var exitYoutuber = function(selection) {
        selection.exit().remove();
    }

    var enterTimeline = function(selection) {
        selection.enter().append('rect')
            .classed('bar', true)
            .attr('x', function(d) {return timeScale(d.publishedDate)})
            .attr('width', barWidth)
            .attr('height', function(d) {return viewScale(d.views)});
    }

    var update = function(data) {
        updateArrow(data);
        updateVideo(data);
        
        var youtuberData = getYoutuberData(data);
        console.log(youtuberData)
        container.selectAll('.youtuber')
            .data(youtuberData)
            .call(exitYoutuber)
            .call(updateYoutuber)
            .call(enterYoutuber);

    }

    var getYoutuberData = function(data) {
        var youtuberData = [];
        youtuberData.push({
            youtuber: data.youtuberObj,
            videos: data.youtuberObj.allVideos,
            type: 'publisher'
        });

        _.each(data.associations, function(association) {
            if (app.youtubersByName[association]) {
                youtuberData.push({
                    youtuber: app.youtubersByName[association],
                    videos: data.youtuberObj.videos[association],
                    type: 'collaborator'
                });
            }
            
        })

        var min = d3.min(data.youtuberObj.allVideos, function(video) {return video.publishedDate}),
            max = d3.max(data.youtuberObj.allVideos, function(video) {return video.publishedDate});
        timeScale.domain([min, max]);

        min = d3.min(data.youtuberObj.allVideos, function(video) {return video.views});
        max = d3.max(data.youtuberObj.allVideos, function(video) {return video.views});
        viewScale.domain([min, max]);

        return youtuberData;
    }

    Summary.position = function(x, y) {
        left = x + app.padding.left;
        top = y + app.padding.top;
        container.attr('transform', 'translate(' + left + ',' + top + ')');

        updateArrow();
    }

    return function() {
        return Summary;
    }
});