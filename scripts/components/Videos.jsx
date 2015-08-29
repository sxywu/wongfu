var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// stores
var VideoStore = require('../stores/VideoStore');
var YoutuberStore = require('../stores/YoutuberStore');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

function updateVideos(selection, videoId) {
  var size = 4;
  selection
    .attr('cx', (data) => data.x)
    .attr('cy', (data) => data.y)
    .attr('r', size)
    .attr('stroke', (data) => data.fill)
    .attr('stroke-width', size / 2)
    .attr('fill', (data) => data.id === videoId ? data.fill : '#fff');
}

var Videos = React.createClass({

  shouldComponentUpdate(nextProps) {
    var videos = _.slice(nextProps.data, 0, nextProps.videoId);
    this.d3Selection = d3.select(this.getDOMNode())
      .selectAll('circle').data(videos, (data) => data.id);

    this.d3Selection.enter().append('circle');
    this.d3Selection.exit().remove();
    this.d3Selection.call(updateVideos, nextProps.videoId);

    return false;
  },

  render() {
    return (
      <g />
    );
  }
});

module.exports = Videos;