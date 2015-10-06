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
var MiniMapComponent = require('./MiniMap.jsx');

var onWindowScroll;
var duration = 200;
var prevVideoId;
var xPadding = 75;
var youtuberSVGHeight = 200;
function calculateTop(top, subtract) {
  return (top || scrollY) + (subtract ? -1 : 1) * (window.innerHeight - youtuberSVGHeight);
}

var allSources = [['cello', 'C2'], ['cello', 'G2'], ['cello', 'C3'], ['violin', 'G3'],
  ['violin', 'C4'], ['violin', 'G4'], ['viola', 'C5'], ['viola', 'G5']];
allSources = _.map(allSources, (source) => {
  return 'sound/' + source[0] + '_' + source[1] + '_3.mp3';
});

sounds.load(allSources);
sounds.whenLoaded = soundsSetup;

var allSounds = [];
function soundsSetup() {
  allSounds = _.map(allSources, (source) => sounds[source]);
}

var App = React.createClass({
  getInitialState() {
    return {
      youtubers: {},
      lines: [],
      videos: [],
      videoId: 1,
      hoverVideoId: null,
      hoverYoutuberName: null,
      top: calculateTop(),
    }
  },

  componentWillMount() {
    ServerActionCreators.getYoutuberNames(() => {
      ServerActionCreators.getYoutubers(() => {
        var youtubers = YoutuberStore.getYoutuberNames();
        _.each(youtubers, (youtuber) => {
          ServerActionCreators.getVideoForYoutuber(youtuber);
        });
      });
    })
    
    VideoStore.addChangeListener(this.onChange);

    onWindowScroll = _.throttle(this.windowScroll.bind(this), duration);
    window.addEventListener('scroll', onWindowScroll);
    // window.addEventListener('scroll', this.playSounds);
  },

  componentWillUnmount() {
    VideoStore.removeChangeListener(this.onChange);
    window.removeEventListener('scroll', onWindowScroll);
    // window.removeEventListener('scroll', this.playSounds);
  },
 
  onChange() {
    var state = {};

    state.youtubers = GraphUtils.calculateYoutubers();
    state.lines = GraphUtils.calculateLines(state.youtubers);
    state.videos = GraphUtils.calculateVideos(state.youtubers);
    state.miniMap = GraphUtils.calculateMiniMap(state.youtubers, state.videos);
    state.top = calculateTop();
    state.videos.length && (state.videoId = this.findVideoId(state.top, state.videos));

    this.setState(state);
  },

  windowScroll() {
    if (!this.state.videos.length) return;
    var top = calculateTop();
    var videoId = this.findVideoId(top);

    this.setState({top, videoId});
  },

  playSounds() {
    if (!this.state.videos.length) return;

    var top = calculateTop();
    var videoId = this.findVideoId(top);
    if (videoId === prevVideoId) return;

    var video = this.state.videos[this.state.videoId - 1];
    if (!video) return;

    var youtuber = this.state.youtubers[video.data.youtuber];
    allSounds[youtuber.order].volume = .75;
    allSounds[youtuber.order].play();
    _.each(video.data.associations, (association) => {
      association = this.state.youtubers[association];
      if (!association) return;
      allSounds[association.order].volume = 1 / video.data.associations.length;
      allSounds[association.order].play();
    });

    prevVideoId = videoId;
  },

  findVideoId(top, videos) {
    videos = videos || this.state.videos;
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

  clickVideo(video) {
    var top = calculateTop(video.y, true) + 1;
    window.scrollTo(0, top);
    this.setState({top: video.y + 1, videoId: video.id});
  },

  hoverVideo(video) {
    this.setState({hoverVideoId: video.id, hoverYoutuberName: null}); 
  },

  unhoverVideo() {
    this.setState({hoverVideoId: null, hoverYoutuberName: null});
  },

  hoverYoutuber(youtuber) {
    this.setState({hoverVideoId: null, hoverYoutuberName: youtuber.name});
  },

  unhoverYoutuber() {
    this.setState({hoverVideoId: null, hoverYoutuberName: null});
  },

  render() {
    var lineWidth = GraphUtils.getSVGWidth(this.state.lines);
    var summaryWidth = window.innerWidth - lineWidth - xPadding * 2;
    var timelineHeight = 10000;
    var summaryDivStyle = {position: 'absolute', top: 0, height: timelineHeight};
    var backgroundSVGStyle = {width: window.innerWidth, height: timelineHeight,
      position: 'absolute', top: 0, left: 0};

    var boxShadow = '0 0 ' + window.innerHeight * .05 + 'px #fff';
    var youtuberSVGStyle = {width: lineWidth, height: youtuberSVGHeight,
      position: 'fixed', bottom: 0, left: 0};

    var lines = (<LinesComponent data={this.state.lines} top={this.state.top}
      videos={this.state.videos} videoId={this.state.videoId} hoverVideoId={this.state.hoverVideoId} />);
    var videos = (<VideosComponent data={this.state.videos} videoId={this.state.videoId}
      hoverVideo={this.hoverVideo} clickVideo={this.clickVideo} hoverVideoId={this.state.hoverVideoId} />);
    var youtubers = (<YoutubersComponent youtubers={this.state.youtubers} videos={this.state.videos}
      videoId={this.state.videoId} hoverVideoId={this.state.hoverVideoId} hoverYoutuberName={this.state.hoverYoutuberName}
      hoverYoutuber={this.hoverYoutuber} unhoverYoutuber={this.unhoverYoutuber} />);
    var videoSummary = (<VideoSummaryComponent youtubers={this.state.youtubers}
      videos={this.state.videos} videoId={this.state.hoverVideoId} unhoverVideo={this.unhoverVideo} />);
    var miniMap = (<MiniMapComponent miniMap={this.state.miniMap} videos={this.state.videos} />);

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
        <div style={summaryDivStyle}>
          {videoSummary}
        </div>
      </div>
    );
  }
});

module.exports = App;