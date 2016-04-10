var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// stores
var VideoStore = require('../stores/VideoStore');
var YoutuberStore = require('../stores/YoutuberStore');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

var duration = 350;

function enterVideos(selection, hoverVideo, clickVideo) {
  selection
    .attr('cx', (data) => data.x)
    .attr('cy', (data) => data.y)
    .attr('r', 0)
    .attr('stroke-width', 2)
    .on('mouseenter', hoverVideo)
    .on('click', clickVideo);
}

function updateVideos(selection, videoId, hoverVideoId) {
  var size = 4;
  selection
    .attr('stroke', (data) => data.id === videoId ? '#fff' : data.fill)
    .attr('fill', (data) => data.id === videoId ? data.fill : '#fff')
    .attr('opacity', (data) => data.id === hoverVideoId ? 0 : 1)
    .transition().duration(duration)
      .attr('r', size);
}

function updateVideoSizes(selection, videoId, hoverVideoId) {
  selection
    .attr('fill', (data) => data.fill)
    .attr('opacity', (data) => data.id === hoverVideoId ? 0 :
      (data.id === videoId ? .75 : .25))
    .transition().duration(duration)
    .attr('r', (data) => data.size)
}

function exitVideos(selection) {
  selection
    .transition().duration(duration)
    .attr('r', 0)
    .remove();
}

module.exports = function() {
  return {
    videos: null,
    videoSizes: null,

    enter(g) {
      this.videoSizes = g.append('g');
      this.videos = g.append('g');
    },

    update(g, nextProps) {
      var videosData = _.slice(nextProps.videos, 0, nextProps.videoId);
      var videos = this.videos.selectAll('circle').data(videosData, (data) => data.id);
      var videoSizes = this.videoSizes.selectAll('circle').data(videosData, (data) => data.id);

      videos.enter().append('circle').call(enterVideos, nextProps.hoverVideo, nextProps.clickVideo);
      videos.exit().call(exitVideos);
      videos.call(updateVideos, nextProps.videoId, nextProps.hoverVideoId);

      videoSizes.enter().append('circle').call(enterVideos);
      videoSizes.exit().call(exitVideos);
      videoSizes.call(updateVideoSizes, nextProps.videoId, nextProps.hoverVideoId);
    },
  }
};
