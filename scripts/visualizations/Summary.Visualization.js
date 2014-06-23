define([
    "jquery",
    "underscore",
    "d3"
], function(
    $,
    _,
    d3
) {
    var container, video;
    var Summary = function(selection) {
        container = selection;

        container
            .call(enterVideo);

        return Summary;
    }

    var enterVideo = function(selection) {
        video = selection.append('g')
            .classed('summaryVideo', true);
        video.append('image')
            .attr('width', 200)
            .attr('height', 150);
        

    }

    var updateVideo  = function(selection) {
     
    }

    return function() {
        return Summary;
    }
});