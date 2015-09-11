var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// stores
var VideoStore = require('../stores/VideoStore');
var YoutuberStore = require('../stores/YoutuberStore');
// utils
var GraphUtils = require('../utils/GraphUtils');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');
// components
var LinesComponent = require('./Lines.jsx');
var VideosComponent = require('./Videos.jsx');
var YoutubersComponent = require('./Youtubers.jsx');
var VideoSummaryComponent = require('./VideoSummary.jsx');

var onWindowScroll;
var duration = 200;
function calculateTop() {
  return scrollY + (window.innerHeight * .6);
}

var App = React.createClass({
  getInitialState() {
    return {
      youtubers: [],
      lines: [],
      videos: [],
      videoId: 1,
      top: calculateTop(),
      image: null
    }
  },

  componentWillMount() {
    var youtubers = YoutuberStore.getYoutuberNames();
    ServerActionCreators.getYoutubers(() => {
      _.each(youtubers, (youtuber) => {
        ServerActionCreators.getVideoForYoutuber(youtuber);
      });
    });

    VideoStore.addChangeListener(this.onChange);

    this.windowScroll();
    onWindowScroll = _.throttle(this.windowScroll.bind(this), duration);
    window.addEventListener('scroll', onWindowScroll);
  },

  componentWillUnmount() {
    VideoStore.removeChangeListener(this.onChange);
    window.removeEventListener('scroll', onWindowScroll);
  },
 
  onChange() {
    var youtubers = GraphUtils.calculateYoutubers();
    var lines = GraphUtils.calculateLines(youtubers);
    var videos = GraphUtils.calculateVideos(youtubers);
    this.setState({youtubers, lines, videos});
  },

  windowScroll() {
    if (!this.state.videos.length) return;

    var top = calculateTop();
    var video;
    var videoId = 0;
    var firstVideo = _.first(this.state.videos);
    var lastVideo = _.last(this.state.videos);
    var image = this.state.image;

    _.some(this.state.videos, (v) => {
      if (v.y >= top) {
        return true;
      }
      video = v;
    });

    if (top < firstVideo.y) {
      // if we're past the last video
      videoId = 0;
    } else if (video) {
      videoId = video.id;
      if (video.data.youtuber === 'wongfuproductions' && video.data.views > 1000000) {
        // if video has more than a million views, change image background
        image = video.data.images[0];
      }

    } else if (top > lastVideo.y) {
      videoId = lastVideo.id;
    }

    this.setState({top, videoId, image});
  },

  render() {
    var lineWidth = GraphUtils.getSVGWidth(this.state.lines);
    var summaryWidth = window.innerWidth - lineWidth - 75;
    var timelineHeight = 30000;
    var summaryDivStyle = {position: 'absolute', top: 0, left: lineWidth,
      width: summaryWidth, height: timelineHeight};
    var backgroundSVGStyle = {width: window.innerWidth, height: timelineHeight,
      position: 'absolute', top: 0, left: 0};

    var boxShadow = '0 0 ' + window.innerHeight * .05 + 'px #fff';
    var youtuberSVGHeight = window.innerHeight * .35;
    var youtuberSVGStyle = {width: lineWidth, height: youtuberSVGHeight,
      position: 'fixed', bottom: 0, left: 0};

    var lines = (<LinesComponent data={this.state.lines}
      top={this.state.top} videoId={this.state.videoId} />);
    var videos = (<VideosComponent data={this.state.videos}
      videoId={this.state.videoId} />);
    var youtubers = (<YoutubersComponent youtubers={this.state.youtubers}
      videos={this.state.videos} videoId={this.state.videoId} />);
    var videoSummary = (<VideoSummaryComponent youtubers={this.state.youtubers}
      videos={this.state.videos} videoId={this.state.videoId} />);

    return (
      <div>
        <svg style={backgroundSVGStyle}>
          {lines}
          {videos}
        </svg>
        <svg style={youtuberSVGStyle}>
          {youtubers}
        </svg>
        <div style={summaryDivStyle}>
          {videoSummary}
        </div>
      </div>
    );
  }
});

module.exports = App;