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
      top: calculateTop()
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
    } else if (top > lastVideo.y) {
      videoId = lastVideo.id;
    }

    this.setState({top, videoId});
  },

  render() {
    var svgWidth = window.innerWidth * .6;
    var boxShadow = '0 0 ' + window.innerHeight * .05 + 'px #fff';
    var lineSVGStyle = {width: svgWidth, height: 20000,
      position: 'absolute', top: 0, left: 0};
    var youtuberSVGStyle = {width: svgWidth, height: window.innerHeight * .35,
      position: 'fixed', bottom: 0, left: 0,
      backgroundColor: 'rgba(255, 255, 255, .5)', boxShadow};
    var lines = (<LinesComponent data={this.state.lines}
      top={this.state.top} videoId={this.state.videoId} />);
    var videos = (<VideosComponent data={this.state.videos}
      videoId={this.state.videoId} />);
    var youtubers = (<YoutubersComponent nodes={_.values(this.state.youtubers)} />);

    return (
      <div>
        <svg style={lineSVGStyle}>
          {lines}
          {videos}
        </svg>
        <svg style={youtuberSVGStyle}>
          {youtubers}
        </svg>
      </div>
    );
  }
});

module.exports = App;