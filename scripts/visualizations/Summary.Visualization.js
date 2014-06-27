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
    var fontColor = "#666";
    var arrowObj, diagonal = d3.svg.diagonal()

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

    var enterYoutuber = function(selection) {
        
    }

    var update = function(data) {
        updateArrow(data);
        updateVideo(data);
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

    var updateVideo  = function(data) {
        console.log(data);
        video.select('image')
            .attr('xlink:href', data.images[0]);
        video.select('.imageBorder')
            .attr('stroke', fontColor);
        video.select('.publishDate')
            .text(app.timeFormat(data.publishedDate) + ' | ' + data.views + ' views');
        video.select('.videoTitle')
            .text(data.title);
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