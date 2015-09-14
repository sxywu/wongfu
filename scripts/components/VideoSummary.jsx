var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

var duration = 200;
var timeFormat = d3.time.format("%a %b %d, %Y");
var numberFormat = d3.format(',');

var VideoSummarys = React.createClass({
  componentDidMount() {
    this.d3Selection = d3.select(this.getDOMNode());
  },

  componentDidUpdate() {
    var video = this.props.videos[this.props.videoId - 1];
    if (!video) return;
    var top = video.y;
    this.d3Selection.transition().duration(duration).style({top});
  },

  labelStyle(color, madeVideo) {
    return {
      fontFamily: 'Helvetica',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'inline-block',
      padding: '0 5px',
      borderRadius: '3px',
      backgroundColor: (madeVideo ? color : '#fff'),
      border: '2px solid ' + color,
      color: (madeVideo ? '#fff' : color),
      margin: '0 5px 5px 0'
    };
  },

  render() {
    var video = this.props.videos[this.props.videoId - 1];
    if (!video) {
      return (<div />);
    }
    var smallTextStyle = {
      fontFamily: 'Helvetica',
      fontSize: '14px',
      color: '#333',
      padding: '5px 0'
    };
    var bigTextStyle = {
      fontFamily: 'Droid Serif',
      fontSize: '22px',
      lineHeight: '24px',
      color: '#333',
    };
    var summaryStyle = {
      position: 'absolute'
    };
    var madeVideo = (<span style={this.labelStyle(video.fill, true)}>{video.data.youtuber}</span>);
    var inVideos = _.chain(video.data.associations)
      .sortBy((association) => {
        var youtuber = this.props.youtubers[association];
        return youtuber && youtuber.data.joinedDate;
      }).map((association) => {
        var youtuber = this.props.youtubers[association];
        var color = youtuber ? youtuber.fill : '#999';
        return (<span style={this.labelStyle(color)}>{association}</span>);
      }).value();

    return (
      <div style={summaryStyle}>
        <div style={smallTextStyle} ref='date'>
          {timeFormat(video.data.publishedDate)}
        </div>
        <div style={bigTextStyle} ref='title'>
          {video.data.title}
        </div>
        <div style={smallTextStyle}>
          {numberFormat(video.data.views) + ' views'}
        </div>
        <div>
          {madeVideo}
          {inVideos}
        </div>
      </div>
    );
  }
});

module.exports = VideoSummarys;