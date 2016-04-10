var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// components
var Lines = require('./Lines.jsx');
var VideosComponent = require('./Videos.jsx');
var Youtubers = require('./Youtubers.jsx');
var MiniMapComponent = require('./MiniMap.jsx');

var onWindowScroll;
var duration = 200;
var playLength = 60000;
var youtuberSVGHeight = 200;
var videoId = 1;
var prevVideoId;
var top = calculateTop();

function calculateTop(top, subtract) {
  return (top || scrollY) + (subtract ? -1 : 1) * (window.innerHeight - youtuberSVGHeight);
}

function findVideoId(top, videos) {
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

  componentWillMount() {
    this.linesComponent = Lines();
    this.youtubersComponent = Youtubers();

    onWindowScroll = _.throttle(() => {
      if (!this.props.videos.length) return;
      top = calculateTop();
      videoId = findVideoId(top, this.props.videos);

      this.updateGraph();
      this.playSounds();
    }, duration);
    window.addEventListener('scroll', onWindowScroll);
  },

  componentDidMount() {
    this.linesSVG = d3.select(this.refs.linesSVG.getDOMNode())
      .call(this.linesComponent.enter.bind(this.linesComponent));
    this.videosSVG = d3.select(this.refs.videosSVG.getDOMNode());
    this.youtubersSVG = d3.select(this.refs.youtubersSVG.getDOMNode())
      .call(this.youtubersComponent.enter.bind(this.youtubersComponent));
  },

  componentDidUpdate() {
    this.updateGraph();
  },

  componentWillUnmount() {
    window.removeEventListener('scroll', onWindowScroll);
  },

  updateGraph() {
    var data = _.merge(this.props, {top, videoId});

    this.linesSVG.call(this.linesComponent.update.bind(this.linesComponent), data);
    this.youtubersSVG.call(this.youtubersComponent.update.bind(this.youtubersComponent), data);
  },

  playSounds() {
    if (!this.props.videos.length) return;

    var top = calculateTop();
    var videoId = findVideoId(top, this.props.videos);
    if (videoId === prevVideoId) return;

    var video = this.props.videos[videoId - 1];
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

  render() {
    var backgroundSVGStyle = {width: window.innerWidth, height: this.props.timelineHeight,
      position: 'absolute', top: 0, left: 0};
    var youtuberSVGStyle = {width: this.props.lineWidth, height: youtuberSVGHeight,
      position: 'fixed', bottom: 0, left: 0};

    // var videos = (<VideosComponent data={this.props.videos} videoId={videoId}
    //   hoverVideo={this.props.hoverVideo} clickVideo={this.clickVideo} hoverVideoId={this.props.hoverVideoId} />);
    var miniMap = (<MiniMapComponent miniMap={this.props.miniMap} videos={this.props.videos} />);

    // var play = (<div style={{
    //   position: 'fixed',
    //   top: 0,
    //   left: 0,
    // }} onClick={this.play} >play</div>);

    return (
      <div>
        {miniMap}
        <svg style={backgroundSVGStyle}>
          <g ref='linesSVG' />
          <g ref='videosSVG' />
        </svg>
        <svg style={youtuberSVGStyle} ref='youtubersSVG' />
      </div>
    );
  }
});

module.exports = Graph;