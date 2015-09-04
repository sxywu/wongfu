var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

var duration = 350;
var timeFormat = d3.time.format("%a %b %d, '%y");

function enterSummary(selection, style) {

  selection.append('text')
    .text((data) => {
      return timeFormat(data.data.publishedDate) + ' | ' + data.data.views + ' views';
    }).attr('dy', '.35em')
    .attr('y', -16)
    .style({
      'font-family': 'Helvetica',
      'font-size': '12px'
    });

  selection.append('text')
    .attr('dy', '.35em')
    .text((data) => data.data.title)
    .style({
      'font-family': 'Droid Serif',
      'font-size': '18px'
    });

  selection.append('text')
    .attr('dy', '.35em')
    .attr('y', 24)
    .text((data) => data.data.youtuber + ', ' + data.data.associations.join(', '))
    .style({
      'font-family': 'Helvetica',
      'font-size': '12px'
    });

  selection
    .attr('opacity', 0)
    .attr('transform', (data) => 'translate(' + style.left + ',' + data.y + ')');
}

function updateSummary(selection, videoId) {
  selection.transition().duration(duration)
    .attr('opacity', (data) => Math.pow(0.5, videoId - data.id));
}

function exitSummary(selection) {
  selection.transition().duration(duration)
    .attr('opacity', 0).remove();
}

var VideoSummarys = React.createClass({
  componentDidMount() {
    this.d3Selection = d3.select(this.getDOMNode());
  },

  shouldComponentUpdate(nextProps) {
    var videos = _.slice(nextProps.videos, nextProps.videoId - 1, nextProps.videoId);
    this.d3Videos = this.d3Selection.selectAll('g')
      .data(videos, (data) => data.id);

    this.d3Videos.enter().append('g').call(enterSummary, nextProps.style);
    this.d3Videos.exit().remove().call(exitSummary);
    this.d3Videos.call(updateSummary, nextProps.videoId);

    return true;
  },

  render() {
    return (
      <g />
    );
  }
});

module.exports = VideoSummarys;