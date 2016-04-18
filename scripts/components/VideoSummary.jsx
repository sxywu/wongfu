var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

var duration = 200;
var timeFormat = d3.time.format("%a %b %d, %Y");
var numberFormat = d3.format(',');
var prevVideoId;
var videoPadding = 0;
var videoBorder = 1;

var smallTextStyle = {
  'font-family': 'Helvetica',
  'font-size': '14px',
  color: '#3A2F2F',
  'z-index': 10,
  padding: '5px 0',
  position: 'relative',
};
var bigTextStyle = {
  'font-family': 'Droid Serif',
  'font-size': '22px',
  'line-height': '24px',
  color: '#3A2F2F',
  'z-index': 10,
  padding: '5px 0',
  position: 'relative',
};

function getLabelStyle(color, madeVideo) {
  return {
    'font-family': 'Helvetica',
    'font-size': '12px',
    'font-weight': 'bold',
    display: 'inline-block',
    padding: '0 5px',
    'border-radius': '3px',
    'background-color': (madeVideo ? color : '#fff'),
    border: '2px solid ' + color,
    color: (madeVideo ? '#fff' : color),
    margin: '0 5px 5px 0'
  };
}

var VideoSummary = React.createClass({

  shouldComponentUpdate(nextProps) {
    var video = nextProps.videos[nextProps.videoId - 1];
    // only update if video doesn't exist and thus we need to hide it
    // or if video we hovered is different from the video previously hovered
    return !video || video.id !== prevVideoId;
  },

  renderImage(video) {
    var url = video && video.data.image.url;
    var width = 360;
    var ratio = video ? width / video.data.image.width : 1;
    var height = video && video.data.image.height * ratio;
    var style = {
      width,
      height,
    };

    return (
      <div style={style}>
        <img src={url} width={width} height={height} />
      </div>
    );
  },

  renderDate(video) {
    var date = video && timeFormat(video.data.publishedDate);
    return (
      <div style={smallTextStyle}>
        {date}
      </div>
    );
  },

  renderTitle(video) {
    var href = video && 'http://www.youtube.com/video/' + video.data.videoId;
    var text = video && video.data.title;

    return (
      <a style={bigTextStyle} target='_new' href={href}>
        {text}
      </a>
    );
  },

  renderAssociations(video, youtubers) {
    var collaborators = _.chain(video && video.data.associations)
      .union(video ? [video.data.youtuber] : [])
      .sortBy((association) => {
        var youtuber = youtubers[association];
        return youtuber && youtuber.data.joinedDate;
      }).map(association => {
        var madeVideo = association === video.data.youtuber;
        var youtuber = youtubers[association];
        var color = youtuber ? youtuber.fill : '#BEB6B6';
        var style = getLabelStyle(color, madeVideo);
        var href = 'http://www.youtube.com/' + association;

        return (
          <a target='_new' href='href' style={style}>
            {association}
          </a>
        );
      }).value();

    return (
      <div style={smallTextStyle}>
        {collaborators}
      </div>
    );
  },

  renderVideoDot(video) {
    var svgStyle = {
      position: 'absolute',
      'z-index': 1,
      cursor: 'pointer',
    };
    var fill = video && video.fill;
    var size = video && video.size;
    var position = video && video.size + videoPadding;
    var dimension = position && position * 2;

    return (
      <svg ref='videoSVG' style={svgStyle} width={dimension} height={dimension}>
        <circle cx={position} cy={position} fill={fill} r={size} opacity='0.75' />
        <circle cx={position} cy={position} fill={fill} r='4' strokeWidth='2' stroke='#fff' />
      </svg>
    );
  },

  renderViews(video) {
    var videoSpanStyle = {
      display: 'inline-block',
      width: 8,
      height: 10,
      margin: '0 8px 0 0',
    };
    var views = video && numberFormat(video.data.views) + ' views';

    return (
      <div>
        <span style={videoSpanStyle} ref='videoSpan' />
        <span style={smallTextStyle}>
          {views}
        </span>
      </div>
    );
  },

  componentDidUpdate() {
    var video = this.props.videos[this.props.videoId - 1];
    if (!video) return;

    // position
    var videoSpan = this.refs.videoSpan && this.refs.videoSpan.getDOMNode();
    var videoX = videoSpan && videoSpan.offsetLeft + videoSpan.offsetWidth / 2;
    var videoY = videoSpan && videoSpan.offsetTop + videoSpan.offsetHeight / 2;

    console.log(videoX, videoY)
    d3.select(this.getDOMNode())
      .style({
        top: video.y - videoY - videoPadding - videoBorder,
        left: video.x - videoX - videoPadding - videoBorder,
      });

    d3.select(this.refs.videoSVG.getDOMNode())
      .style({
        'top': -video.size - videoPadding + videoY,
        'left': -video.size - videoPadding + videoX,
      });
  },

  render() {
    var video = this.props.videos[this.props.videoId - 1];
    var youtubers = this.props.youtubers;

    var summaryStyle = {
      display: video ? 'block' : 'none',
      position: 'absolute',
      backgroundColor: 'rgba(255,255,255,.65)',
      padding: '10px 20px 5px 20px',
      border: '1px solid #BEB6B6',
      bowShadow: '0 0 10px #BEB6B6',
      borderRadius: '3px',
    };

    prevVideoId = video && video.id;

    return (
      <div style={summaryStyle} onMouseLeave={this.props.unhoverVideo}>
        {this.renderVideoDot(video)}
        {this.renderImage(video)}
        {this.renderDate(video)}
        {this.renderTitle(video)}
        {this.renderAssociations(video, youtubers)}
        {this.renderViews(video)}
      </div>
    );
  }
});

module.exports = VideoSummary;