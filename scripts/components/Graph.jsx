var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// utils
var GraphUtils = require('../utils/GraphUtils');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');
// components
var LinesComponent = require('./Lines.jsx');
var VideosComponent = require('./Videos.jsx');
var YoutubersComponent = require('./Youtubers.jsx');
var VideoSummaryComponent = require('./VideoSummary.jsx');
var MiniMapComponent = require('./MiniMap.jsx');

var onWindowScroll;
var duration = 250;
var playLength = 60000;
var prevVideoId;
var youtuberSVGHeight = 200;
function calculateTop(top, subtract) {
  return (top || scrollY) + (subtract ? -1 : 1) * (window.innerHeight - youtuberSVGHeight);
}

var allSounds = [
  () => {soundEffect(65.41, 0, 0.2, "triangle", 1, -0.8)},
  () => {soundEffect(98.00, 0, 0.2, "triangle", 1, 0.8)},
  () => {soundEffect(130.81, 0, 0.2, "triangle", 1, -0.8)},
  () => {soundEffect(196.00, 0, 0.2, "triangle", 1, 0.8)},
  () => {soundEffect(261.63, 0, 0.2, "triangle", 1, -0.8)},
  () => {soundEffect(392.00, 0, 0.2, "triangle", 1, 0.8)},
  () => {soundEffect(523.25, 0, 0.2, "triangle", 1, -0.8)},
  () => {soundEffect(783.99, 0, 0.2, "triangle", 1, 0.8)} // consider sine or triangle
];

var Graph = React.createClass({
  getInitialState() {
    return {
      videoId: 1,
      top: calculateTop(),
    }
  },

  componentWillMount() {
    onWindowScroll = _.throttle(() => {
      this.windowScroll();
      this.playSounds();
    }, duration);
    window.addEventListener('scroll', onWindowScroll);
  },

  componentWillUnmount() {
    window.removeEventListener('scroll', onWindowScroll);
  },

  windowScroll() {
    if (!this.props.videos.length) return;
    var top = calculateTop();
    var videoId = this.findVideoId(top);

    this.setState({top, videoId});
  },

  playSounds() {
    if (!this.props.videos.length) return;

    var top = calculateTop();
    var videoId = this.findVideoId(top);
    if (videoId === prevVideoId) return;

    var video = this.props.videos[this.state.videoId - 1];
    if (!video) return;

    var youtuber = this.props.youtubers[video.data.youtuber];
    allSounds[youtuber.order]();
    _.each(video.data.associations, (association) => {
      association = this.props.youtubers[association];
      if (!association) return;
      allSounds[association.order]();
    });

    prevVideoId = videoId;
  },

  findVideoId(top, videos) {
    videos = videos || this.props.videos;
    var video;
    var videoId = 0;
    var firstVideo = _.first(videos);
    var lastVideo = _.last(videos);

    _.some(videos, (v) => {
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

    return videoId;
  },

  render() {
    var backgroundSVGStyle = {width: window.innerWidth, height: this.props.timelineHeight,
      position: 'absolute', top: 0, left: 0};
    var youtuberSVGStyle = {width: this.props.lineWidth, height: youtuberSVGHeight,
      position: 'fixed', bottom: 0, left: 0};

    var lines = (<LinesComponent data={this.props.lines} top={this.state.top}
      videos={this.props.videos} videoId={this.state.videoId} hoverVideoId={this.props.hoverVideoId} />);
    var videos = (<VideosComponent data={this.props.videos} videoId={this.state.videoId}
      hoverVideo={this.props.hoverVideo} clickVideo={this.clickVideo} hoverVideoId={this.props.hoverVideoId} />);
    var youtubers = (<YoutubersComponent youtubers={this.props.youtubers} videos={this.props.videos}
      videoId={this.state.videoId} hoverVideoId={this.props.hoverVideoId} hoverYoutuberName={this.props.hoverYoutuberName}
      hoverYoutuber={this.props.hoverYoutuber} unhoverYoutuber={this.props.unhoverYoutuber} />);
    var miniMap = (<MiniMapComponent miniMap={this.props.miniMap} videos={this.props.videos} />);

    var play = (<div style={{
      position: 'fixed',
      top: 0,
      left: 0,
    }} onClick={this.play} >play</div>);

    return (
      <div>
        {miniMap}
        <svg style={backgroundSVGStyle}>
          {lines}
          {videos}
        </svg>
        <svg style={youtuberSVGStyle}>
          {youtubers}
        </svg>
        {play}
      </div>
    );
  }
});

module.exports = Graph;