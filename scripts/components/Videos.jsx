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
    .style({
      cursor: 'pointer'
    }).on('mouseenter', hoverVideo)
    .on('click', clickVideo);
}

function updateVideos(selection, videoId) {
  var size = 4;
  selection
    .attr('stroke', (data) => data.id === videoId ? '#fff' : data.fill)
    .attr('fill', (data) => data.id === videoId ? data.fill : '#fff')
    .transition().duration(duration)
      .attr('r', size);
}

function updateVideoSizes(selection, videoId) {
  selection
    .attr('fill', (data) => data.fill)
    .attr('opacity', (data) => data.id === videoId ? .75 : .25)
    .transition().duration(duration)
    .attr('r', (data) => data.size)
}

function exitVideos(selection) {
  selection
    .transition().duration(duration)
    .attr('r', 0)
    .remove();
}

var Videos = React.createClass({

  shouldComponentUpdate(nextProps) {
    var videos = _.chain(nextProps.data)
      .slice(0, nextProps.videoId)
      .sortBy((data) => -data.size)
      .value();
    this.d3Videos = d3.select(this.refs.videos.getDOMNode())
      .selectAll('circle').data(videos, (data) => data.id);
    this.d3VideoSizes = d3.select(this.refs.videoSizes.getDOMNode())
      .selectAll('circle').data(videos, (data) => data.id);

    this.d3Videos.enter().append('circle').call(enterVideos, nextProps.hoverVideo, nextProps.clickVideo);
    this.d3Videos.exit().call(exitVideos);
    this.d3Videos.call(updateVideos, nextProps.videoId);

    this.d3VideoSizes.enter().append('circle').call(enterVideos, nextProps.hoverVideo, nextProps.clickVideo);
    this.d3VideoSizes.exit().call(exitVideos);
    this.d3VideoSizes.call(updateVideoSizes, nextProps.videoId);

    return false;
  },

  render() {
    return (
      <g>
        <g ref="videoSizes" />
        <g ref="videos" />
      </g>
    );
  }
});

module.exports = Videos;